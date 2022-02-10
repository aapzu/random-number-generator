"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const luxon_1 = require("luxon");
const randomNumberGenerator_1 = require("./randomNumberGenerator");
const ejs_1 = __importDefault(require("ejs"));
const numberSvgTemplatePath = path_1.default.resolve(__dirname, 'templates/numberSvg.ejs');
const port = process.env.PORT || 3333;
const app = (0, express_1.default)();
const getJson = (from, to) => ({
    success: true,
    number: (0, randomNumberGenerator_1.generateRandomNumber)(from, to),
    updatedDate: luxon_1.DateTime.now().toFormat('MM.dd.yyyy HH:mm:ss')
});
app.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { from = 0, to = from + 10, showUpdatedDate = false } = req.query;
    try {
        res.json(getJson(from, to));
    }
    catch (err) {
        return next(err);
    }
}));
app.get('/image', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { from = 0, to = from + 10, showUpdatedDate = false, width = 300, height = 300 } = req.query;
    try {
        const { number, updatedDate } = getJson(from, to);
        const svgString = yield ejs_1.default.renderFile(numberSvgTemplatePath, {
            showUpdatedDate,
            width,
            height,
            item: number,
            currentDate: updatedDate
        }, {});
        res.send(svgString);
    }
    catch (err) {
        return next(err);
    }
}));
app.get('/imageFromList', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { options, showUpdatedDate = false, width = 300, height = 300 } = req.query;
    try {
        if (!options) {
            throw new Error('no options given');
        }
        const optionsList = !Array.isArray(options) ? [options] : options;
        const { number, updatedDate } = getJson(0, optionsList.length - 1);
        const svgString = yield ejs_1.default.renderFile(numberSvgTemplatePath, {
            showUpdatedDate,
            width,
            height,
            item: optionsList[number],
            currentDate: updatedDate
        }, {});
        res.send(svgString);
    }
    catch (err) {
        return next(err);
    }
}));
const errorHandler = (err, _req, res, _next) => {
    res.status(500).json({
        success: false,
        error: err.message
    });
};
app.use(errorHandler);
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
//# sourceMappingURL=index.js.map