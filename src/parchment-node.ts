import Registry = require('./registry');
import ShadowNode = require('./shadow-node');


class ParchmentNode extends ShadowNode {
  static nodeName = 'node';
  static scope = Registry.Scope.BLOCK;

  class;

  constructor(value: Node, NodeClass) {
    this.class = NodeClass;
    value = this.init(value);
    super(value);
    this.build();
  }

  build(): void {
    var childNodes = Array.prototype.slice.call(this.domNode.childNodes || []);
    childNodes.forEach((node) => {
      var child = Registry.attach(node);
      if (!!child) {
        this.append(child);
      } else if (!!node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  init(value: Node): any {
    return value || document.createElement(this.class.tagName);
  }

  clone(): ParchmentNode {
    var domNode = this.domNode.cloneNode();
    return Registry.create(this.class.nodeName, domNode);
  }

  getLength(): number {
    return this.children.reduce(function(memo, child) {
      return memo + child.getLength();
    }, 0);
  }

  getValue():any[] {
    return this.children.reduce(function(value, child) {
      return value.concat(child.getValue());
    }, []);
  }

  deleteText(index: number, length: number): void {
    if (index === 0 && length === this.getLength()) {
      this.remove();
    } else {
      this.children.forEachAt(index, length, function(child, offset, length) {
        child.deleteText(offset, length);
      });
    }
  }

  formatText(index: number, length: number, name: string, value: any): void {
    if (this.class.nodeName === name) {
      if (!!value) return;
      var target = this.isolate(index, length);
      target.unwrap();
    } else {
      this.children.forEachAt(index, length, function(child, offset, length) {
        child.formatText(offset, length, name, value);
      });
    }
  }

  insertEmbed(index: number, name: string, value: any): void {
    var _arr = this.children.find(index);
    var child = <ParchmentNode>_arr[0], offset = _arr[1];
    child.insertEmbed(offset, name, value);
  }

  insertText(index: number, text: string): void {
    var _arr = this.children.find(index);
    var child = <ParchmentNode>_arr[0], offset = _arr[1];
    child.insertText(offset, text);
  }
}


export = ParchmentNode;
