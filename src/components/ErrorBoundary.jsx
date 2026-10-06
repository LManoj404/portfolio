import { Component } from "react";

/**
 * Minimal React error boundary.
 * Prevents any optional part of the experience (3D scene, Lottie, fonts...)
 * from blanking the entire portfolio when it fails at runtime.
 *
 * Usage: <ErrorBoundary fallback={null}>...</ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prevProps) {
    // Allow recovery when the boundary is reused after the failure is fixed.
    if (this.state.failed && prevProps.children !== this.props.children) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return typeof this.props.fallback === "function"
        ? this.props.fallback()
        : this.props.fallback;
    }
    return this.props.children;
  }
}