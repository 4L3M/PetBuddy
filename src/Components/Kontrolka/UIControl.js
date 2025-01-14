import React from 'react';
import { UIEvent } from './UIEvent'; // Import UIEvent class

export class UIControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEnabled: props.isEnabled || true,
    };
  }

  render() {
    return <div>{this.props.children}</div>;
  }

  onClick() {
    const event = new UIEvent('click', this);
    this.props.onEvent(event);  // Emit event to parent listener
    console.log('UIControl clicked');
  }

  onFocus() {
    const event = new UIEvent('focus', this);
    this.props.onEvent(event);
    console.log('UIControl focused');
  }

  onHover() {
    const event = new UIEvent('hover', this);
    this.props.onEvent(event);
    console.log('UIControl hovered');
  }
}
