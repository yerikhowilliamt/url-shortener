"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const port = process.env.PORT || 4000;
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization',
        credentials: true,
    });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('URL Shortener')
        .setDescription('API for shortened URL')
        .setVersion('1.0')
        .addTag('urls')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config, {
        deepScanRoutes: true,
    });
    swagger_1.SwaggerModule.setup('api', app, document, {
        explorer: true,
        swaggerOptions: {
            defaultModelsExpandDepth: -1,
            supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
        },
    });
    await app.listen(port);
    console.log(`Listening to port: ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map