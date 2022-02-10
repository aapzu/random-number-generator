"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomNumber = void 0;
const generateRandomNumber = (from, to) => {
    if (from > to) {
        throw new Error(`from cannot be bigger than to! from: ${from}, to: ${to}`);
    }
    return Math.floor(Math.random() * (to + 1)) + from;
};
exports.generateRandomNumber = generateRandomNumber;
//# sourceMappingURL=randomNumberGenerator.js.map