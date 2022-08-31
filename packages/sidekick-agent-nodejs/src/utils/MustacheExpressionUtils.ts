const Mustache = require('mustache');

export default class MustacheUtils {
    static render(expression: string, model: any) {
        return Mustache.render(expression, model);
    }
}