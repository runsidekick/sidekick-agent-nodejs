import * as estree from 'estree';

/**
 * Validates if the AST represented by the node has obvious side-effects.
 * It catches the most common cases such as assignments, method calls, and
 * control flow. It doesn't (presently) catch property access that may end
 * up calling accessors.
 *
 * @param {Object} node AST Node (as per the Mozilla Parser API)
 * @return {boolean} if the exper
 */

export default class AstValidator {
  static isValid(node: estree.Node | null): boolean {
    // Empty expression is allowed
    if (node === null) {
      return true;
    }
  
    switch (node.type) {
      case 'Program':
        return node.body.every(AstValidator.isValid);
  
      //
      // S T A T E M E N T S
      //
      case 'EmptyStatement':
        return true;
      case 'ExpressionStatement':
        return AstValidator.isValid(node.expression);
      case 'BlockStatement':
        return node.body.every(AstValidator.isValid);
      case 'LabeledStatement':
        return AstValidator.isValid(node.body);
  
      //
      // E X P R E S S I O N S
      //
      case 'AssignmentExpression':
      case 'CallExpression':
      case 'FunctionExpression':
      case 'NewExpression':
      case 'UpdateExpression':
        return false;
  
      case 'Identifier':
      case 'Literal':
      case 'ThisExpression':
        return true;
  
      case 'ArrayExpression':
        return node.elements.every(AstValidator.isValid);
  
      case 'BinaryExpression':
      case 'LogicalExpression':
        return AstValidator.isValid(node.left) && AstValidator.isValid(node.right);
  
      case 'ConditionalExpression':
        return (
          AstValidator.isValid(node.test) &&
          AstValidator.isValid(node.alternate) &&
          AstValidator.isValid(node.consequent)
        );
  
      case 'MemberExpression':
        return AstValidator.isValid(node.object) && AstValidator.isValid(node.property);
  
      case 'ObjectExpression':
        // every property is a valid expression
        return node.properties.every(prop => {
          return AstValidator.isValid((prop as {value: estree.Node}).value);
        });
  
      case 'SequenceExpression':
        return node.expressions.every(AstValidator.isValid);
  
      case 'UnaryExpression':
        return AstValidator.isValid(node.argument);
  
      case 'SpreadElement':
        return AstValidator.isValid(node.argument);
  
      case 'TemplateLiteral':
        return node.quasis.every(AstValidator.isValid) && node.expressions.every(AstValidator.isValid);
      case 'TaggedTemplateExpression':
        return AstValidator.isValid(node.tag) && AstValidator.isValid(node.quasi);
      case 'TemplateElement':
        return true;
  
      default:
        return false;
    }
  }
}