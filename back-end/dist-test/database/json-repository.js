"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRepository = void 0;
const uuid_1 = require("uuid");
class JsonRepository {
    constructor(collectionName, dbService) {
        this.collectionName = collectionName;
        this.dbService = dbService;
    }
    getCollectionName() {
        return this.collectionName;
    }
    async find(options = {}) {
        let items = await this.dbService.getCollection(this.collectionName);
        if (options.where) {
            items = items.filter((item) => this.matchFilter(item, options.where));
        }
        if (options.sort) {
            items = this.applySorting(items, options.sort);
        }
        if (typeof options.skip === 'number' && options.skip > 0) {
            items = items.slice(options.skip);
        }
        if (typeof options.limit === 'number' && options.limit > 0) {
            items = items.slice(0, options.limit);
        }
        if (options.select && options.select.length > 0) {
            items = items.map((item) => {
                const selected = {};
                for (const key of options.select) {
                    selected[key] = item[key];
                }
                return selected;
            });
        }
        return items;
    }
    async findAndCount(options = {}) {
        let items = await this.dbService.getCollection(this.collectionName);
        if (options.where) {
            items = items.filter((item) => this.matchFilter(item, options.where));
        }
        const total = items.length;
        if (options.sort) {
            items = this.applySorting(items, options.sort);
        }
        const limit = options.limit && options.limit > 0 ? options.limit : total || 10;
        const skip = options.skip || 0;
        const page = Math.floor(skip / limit) + 1;
        const totalPages = Math.ceil(total / limit) || 1;
        const pagedItems = items.slice(skip, skip + limit);
        return {
            items: pagedItems,
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        };
    }
    async findOne(where) {
        const items = await this.dbService.getCollection(this.collectionName);
        const found = items.find((item) => this.matchFilter(item, where));
        return found ? JSON.parse(JSON.stringify(found)) : null;
    }
    async findById(id) {
        return this.findOne({ id });
    }
    async create(data) {
        const items = await this.dbService.getCollection(this.collectionName);
        const now = new Date().toISOString();
        const id = data.id || `${this.collectionName.substring(0, 3)}-${(0, uuid_1.v4)().substring(0, 8)}`;
        const newRecord = {
            ...data,
            id,
            createdAt: data.createdAt || now,
            updatedAt: now,
        };
        items.unshift(newRecord);
        await this.dbService.setCollection(this.collectionName, items);
        return JSON.parse(JSON.stringify(newRecord));
    }
    async createMany(dataList) {
        const items = await this.dbService.getCollection(this.collectionName);
        const now = new Date().toISOString();
        const createdRecords = [];
        for (const data of dataList) {
            const id = data.id || `${this.collectionName.substring(0, 3)}-${(0, uuid_1.v4)().substring(0, 8)}`;
            const record = {
                ...data,
                id,
                createdAt: data.createdAt || now,
                updatedAt: now,
            };
            createdRecords.push(record);
            items.unshift(record);
        }
        await this.dbService.setCollection(this.collectionName, items);
        return JSON.parse(JSON.stringify(createdRecords));
    }
    async update(id, data) {
        const items = await this.dbService.getCollection(this.collectionName);
        const index = items.findIndex((item) => item.id === id);
        if (index === -1)
            return null;
        const updatedRecord = {
            ...items[index],
            ...data,
            id,
            updatedAt: new Date().toISOString(),
        };
        items[index] = updatedRecord;
        await this.dbService.setCollection(this.collectionName, items);
        return JSON.parse(JSON.stringify(updatedRecord));
    }
    async updateMany(where, data) {
        const items = await this.dbService.getCollection(this.collectionName);
        let count = 0;
        const now = new Date().toISOString();
        for (let i = 0; i < items.length; i++) {
            if (this.matchFilter(items[i], where)) {
                items[i] = {
                    ...items[i],
                    ...data,
                    id: items[i].id,
                    updatedAt: now,
                };
                count++;
            }
        }
        if (count > 0) {
            await this.dbService.setCollection(this.collectionName, items);
        }
        return count;
    }
    async delete(id) {
        const items = await this.dbService.getCollection(this.collectionName);
        const initialLength = items.length;
        const filtered = items.filter((item) => item.id !== id);
        if (filtered.length !== initialLength) {
            await this.dbService.setCollection(this.collectionName, filtered);
            return true;
        }
        return false;
    }
    async deleteMany(where) {
        const items = await this.dbService.getCollection(this.collectionName);
        const filtered = items.filter((item) => !this.matchFilter(item, where));
        const deletedCount = items.length - filtered.length;
        if (deletedCount > 0) {
            await this.dbService.setCollection(this.collectionName, filtered);
        }
        return deletedCount;
    }
    async count(where) {
        const items = await this.dbService.getCollection(this.collectionName);
        if (!where)
            return items.length;
        return items.filter((item) => this.matchFilter(item, where)).length;
    }
    matchFilter(item, filter) {
        if (!filter || Object.keys(filter).length === 0)
            return true;
        if (filter.$or && Array.isArray(filter.$or)) {
            const matchesOr = filter.$or.some((subFilter) => this.matchFilter(item, subFilter));
            if (!matchesOr)
                return false;
        }
        if (filter.$and && Array.isArray(filter.$and)) {
            const matchesAnd = filter.$and.every((subFilter) => this.matchFilter(item, subFilter));
            if (!matchesAnd)
                return false;
        }
        for (const [key, filterValue] of Object.entries(filter)) {
            if (key === '$or' || key === '$and')
                continue;
            const itemValue = item[key];
            if (filterValue && typeof filterValue === 'object' && !Array.isArray(filterValue) && !(filterValue instanceof RegExp) && !(filterValue instanceof Date)) {
                const opKeys = Object.keys(filterValue);
                for (const op of opKeys) {
                    const expected = filterValue[op];
                    switch (op) {
                        case '$eq':
                            if (itemValue !== expected)
                                return false;
                            break;
                        case '$ne':
                            if (itemValue === expected)
                                return false;
                            break;
                        case '$gt':
                            if (!(itemValue > expected))
                                return false;
                            break;
                        case '$gte':
                            if (!(itemValue >= expected))
                                return false;
                            break;
                        case '$lt':
                            if (!(itemValue < expected))
                                return false;
                            break;
                        case '$lte':
                            if (!(itemValue <= expected))
                                return false;
                            break;
                        case '$in':
                            if (!Array.isArray(expected) || !expected.includes(itemValue))
                                return false;
                            break;
                        case '$nin':
                            if (Array.isArray(expected) && expected.includes(itemValue))
                                return false;
                            break;
                        case '$regex':
                            const regex = expected instanceof RegExp ? expected : new RegExp(expected, 'i');
                            if (typeof itemValue !== 'string' || !regex.test(itemValue))
                                return false;
                            break;
                        case '$contains':
                            if (typeof itemValue !== 'string' || !itemValue.toLowerCase().includes(String(expected).toLowerCase())) {
                                return false;
                            }
                            break;
                        case '$exists':
                            const exists = itemValue !== undefined && itemValue !== null;
                            if (exists !== expected)
                                return false;
                            break;
                    }
                }
            }
            else if (filterValue instanceof RegExp) {
                if (typeof itemValue !== 'string' || !filterValue.test(itemValue))
                    return false;
            }
            else {
                if (itemValue !== filterValue)
                    return false;
            }
        }
        return true;
    }
    applySorting(items, sort) {
        const sorted = [...items];
        const sortEntries = Object.entries(sort);
        sorted.sort((a, b) => {
            for (const [field, direction] of sortEntries) {
                const valA = a[field];
                const valB = b[field];
                const isAsc = direction === 'ASC' || direction === 'asc' || direction === 1;
                if (valA === valB)
                    continue;
                if (valA === undefined || valA === null)
                    return isAsc ? 1 : -1;
                if (valB === undefined || valB === null)
                    return isAsc ? -1 : 1;
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return isAsc ? valA - valB : valB - valA;
                }
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                if (strA < strB)
                    return isAsc ? -1 : 1;
                if (strA > strB)
                    return isAsc ? 1 : -1;
            }
            return 0;
        });
        return sorted;
    }
}
exports.JsonRepository = JsonRepository;
//# sourceMappingURL=json-repository.js.map