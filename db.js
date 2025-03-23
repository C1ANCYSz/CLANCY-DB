const fs = require('fs-extra');
const _ = require('lodash');
const AsyncLock = require('async-lock');
const Joi = require('joi');

class DB {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = {};
        this.lock = new AsyncLock();
        this._loadData();
    }

    _saveData() {
        this.lock.acquire('write', () => {
            fs.writeJSONSync(this.filePath, this.data, { spaces: 2 });
        });
    }

    _loadData() {
        if (fs.existsSync(this.filePath)) {
            this.data = fs.readJSONSync(this.filePath);
        } else {
            this.data = {};
            this._saveData();
        }
    }

    collection(name) {
        if (!this.data[name]) {
            this.data[name] = [];
            this._saveData();
        }
        return new Collection(name, this);
    }

    model(name, fields) {
        const collection = this.collection(name);
        const schema = this._generateSchema(fields);
        return new Model(collection, schema);
    }

    _generateSchema(fields) {
        const schemaObject = {};
        for (let field in fields) {
            const fieldDef = fields[field];
            let joiField = Joi[fieldDef.type]();
            
            if (fieldDef.args) {
                fieldDef.args.forEach(arg => {
                    if (arg === 'integer') {
                        joiField = joiField.integer();
                    } else if (typeof arg === 'number') {
                        joiField = joiField.min(arg);
                    }
                });
            }

            schemaObject[field] = fieldDef.required ? joiField.required() : joiField;
        }
        return Joi.object(schemaObject);
    }
}

class Collection {
    constructor(name, db) {
        this.name = name;
        this.db = db;
        this.indexes = {};
    }

    createIndex(field) {
        this.indexes[field] = _.groupBy(this.db.data[this.name], field);
    }

    find(query = {}) {
        const indexedField = Object.keys(query).find(field => this.indexes[field]);
        if (indexedField) {
            return this.indexes[indexedField][query[indexedField]] || [];
        }
        return _.filter(this.db.data[this.name], query);
    }

    // Aggregation pipeline
    aggregate(pipeline) {
        let results = [...this.db.data[this.name]];

        for (const stage of pipeline) {
            const [operator, params] = Object.entries(stage)[0];

            switch (operator) {
                case '$match':
                    results = results.filter(doc => {
                        for (let [key, condition] of Object.entries(params)) {
                            if (typeof condition === 'object' && !Array.isArray(condition)) {
                                for (let [op, value] of Object.entries(condition)) {
                                    switch (op) {
                                        case '$gte':
                                            if (doc[key] < value) return false;
                                            break;
                                        case '$lte':
                                            if (doc[key] > value) return false;
                                            break;
                                        case '$gt':
                                            if (doc[key] <= value) return false;
                                            break;
                                        case '$lt':
                                            if (doc[key] >= value) return false;
                                            break;
                                        case '$eq':
                                            if (doc[key] !== value) return false;
                                            break;
                                        case '$ne':
                                            if (doc[key] === value) return false;
                                            break;
                                        case '$in':
                                            if (!value.includes(doc[key])) return false;
                                            break;
                                        case '$nin':
                                            if (value.includes(doc[key])) return false;
                                            break;
                                        case '$regex':
                                            if (!new RegExp(value).test(doc[key])) return false;
                                            break;
                                        default:
                                            throw new Error(`Unsupported operator: ${op}`);
                                    }
                                }
                            } else {
                                if (doc[key] !== condition) return false;
                            }
                        }
                        return true;
                    });
                    break;
                case '$sort':
                    results = _.orderBy(results, Object.keys(params), Object.values(params).map(v => (v > 0 ? 'asc' : 'desc')));
                    break;
                    case '$group':
    results = Object.values(_.groupBy(results, params._id)).map(group => {
        const result = { _id: group[0][params._id] };
        for (const [key, func] of Object.entries(params)) {
            if (key === '_id') continue;
            if (func.$sum) {

                if (func.$sum === 1) {
                    result[key] = group.length; 
                } else {
                    result[key] = _.sumBy(group, doc => doc[func.$sum]); 
                }
            }
            if (func.$avg) {
                result[key] = _.meanBy(group, func.$avg);
            }
            if (func.$min) {
                result[key] = _.minBy(group, func.$min);
            }
            if (func.$max) {
                result[key] = _.maxBy(group, func.$max);
            }
            if (func.$count) {
                result[key] = group.length;
            }
        }
        return result;
    });
    break;

                    
                case '$limit':
                    results = results.slice(0, params);
                    break;
                case '$skip':
                    results = results.slice(params);
                    break;
                case '$project':
                    results = results.map(doc => {
                        let projectedDoc = {};
                        for (let key in doc) {
                            if (params[key] !== 0) {
                                projectedDoc[key] = doc[key];
                            }
                        }
                        for (let key in params) {
                            if (params[key] === 0) {
                                delete projectedDoc[key];
                            }
                        }
                        return projectedDoc;
                    });
                    break;
                case '$unwind':
                    results = results.flatMap(doc => doc[params.path] || []);
                    break;
                case '$lookup':
                    results = results.map(doc => {
                        const joinedDocs = this.db.data[params.from];
                        doc[params.as] = joinedDocs.filter(joinedDoc => joinedDoc[params.localField] === doc[params.foreignField]);
                        return doc;
                    });
                    break;
                case '$count':
                    results = [{ count: results.length }];
                    break;
                default:
                    throw new Error(`Unknown aggregation operator: ${operator}`);
            }
        }

        return results;
    }
}


class Model {
    constructor(collection, schema) {
        this.collection = collection;
        this.schema = schema;
    }

    validate(doc) {
        const { error } = this.schema.validate(doc);
        if (error) throw new Error(`Validation failed: ${error.message}`);
    }

    validateUpdate(update) {
        const updateSchema = this.schema.tailor('update'); // Allow partial updates
        const { error } = updateSchema.validate(update);
        if (error) throw new Error(`Validation failed: ${error.message}`);
    }

    insert(doc) {
        this.validate(doc);
        return this.collection.insert(doc);
    }

    update(query, update, options = { runValidators: true }) {
        return this.collection.update(query, update, options);
    }

    find(query) {
        return this.collection.find(query);
    }

    delete(query) {
        return this.collection.delete(query);
    }

    aggregate(pipeline) {
        return this.collection.aggregate(pipeline);
    }
}

module.exports = DB;
