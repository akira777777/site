"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('app.port') ?? 4000;
    const origins = configService.get('app.frontendOrigins') ?? [
        'http://localhost:3000',
    ];
    app.setGlobalPrefix('api/v1');
    app.enableCors({
        credentials: true,
        origin: origins,
    });
    app.use((0, cookie_parser_1.default)());
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map