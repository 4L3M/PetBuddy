import React from "react";

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
    console.log("UIControl clicked");
  }

  onFocus() {
    console.log("UIControl focused");
  }

  onHover() {
    console.log("UIControl hovered");
  }


}
