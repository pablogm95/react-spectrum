/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import Button from '../../Button';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
import {trapFocus} from '../../utils/FocusManager';
import '../style/index.styl';

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class CoachMarkPopover extends React.Component {
  static propTypes = {
    /** Title */
    title: PropTypes.string.isRequired,

    /**
     * Text of the primary button.
     * Required if using Coachmarks on their own. Can't use `.required`
     * though because Tour can provide a default.
     **/
    confirmLabel: PropTypes.string,

    /** Event Handler for the confirm button */
    onConfirm: PropTypes.func,

    /** Text of the secondary button */
    cancelLabel: PropTypes.string,

    /** Event Handler for the cancel button */
    onCancel: PropTypes.func,

    /** Hide progress */
    disableProgress: PropTypes.bool,

    /** Url to an image to display */
    image: PropTypes.string,

    /** Text alternative for image */
    imageAlt: PropTypes.string,

    /** Current step */
    currentStep: PropTypes.number,

    /** Total amount of steps */
    totalSteps: PropTypes.number,

    /** Whether to autofocus on mount */
    autoFocus: PropTypes.bool,

    /** Whether to trapFocus within coachmark */
    trapFocus: PropTypes.bool,

    /** tabIndex property to manage how coachmark popover is included in the keyboard navigation order */
    tabIndex: PropTypes.number,

    /** String that will override the default id generated by the instance */
    id: PropTypes.string
  };

  static defaultProps = {
    autoFocus: true,
    imageAlt: '',
    trapFocus: true
  };

  constructor(props) {
    super(props);
    this.coachmarkId = createId();
  }

  componentDidMount() {
    if (this.props.trapFocus) {
      this._trapFocusTimeout = requestAnimationFrame(() => {
        if (this.coachmarkRef && !this.coachmarkRef.contains(document.activeElement)) {
          this.coachmarkRef.focus();
        }
      });
    }
  }

  componentWillUnmount() {
    if (this._trapFocusTimeout) {
      cancelAnimationFrame(this._trapFocusTimeout);
    }
  }

  onFocus(e) {
    if (this.props.onFocus) {
      this.props.onFocus(e);
    }
    if (this.props.trapFocus) {
      trapFocus(this, e);
    }
  }

  onKeyDown(e) {
    if (this.props.onKeyDown) {
      this.props.onKeyDown(e);

      // Do nothing if stopPropagation has been called on event after onKeyDown prop executes.
      if (e.isPropagationStopped && e.isPropagationStopped()) {
        return;
      }
    }

    if (this.props.trapFocus) {
      trapFocus(this, e);
    }
  }

  render() {
    let {
      title,
      confirmLabel,
      onConfirm,
      cancelLabel,
      onCancel,
      disableProgress,
      currentStep,
      totalSteps,
      image,
      children,
      id = this.coachmarkId,
      tabIndex,
      imageAlt = '',
      autoFocus,
      trapFocus,
      ...otherProps
    } = this.props;

    disableProgress = disableProgress || typeof currentStep !== 'number' || typeof totalSteps !== 'number';

    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    return (<div
      {...filterDOMProps(otherProps)}
      className="spectrum-CoachMarkPopover"
      role="dialog"
      aria-labelledby={`${id}-header`}
      aria-describedby={`${id}-content`}
      id={id}
      ref={c => this.coachmarkRef = c}
      onFocus={this.onFocus}
      onKeyDown={this.onKeyDown}
      tabIndex={trapFocus && tabIndex == null ? 1 : tabIndex}>
      {image && <img src={image} alt={imageAlt} className="spectrum-CoachMarkPopover-image" />}
      <div className="spectrum-CoachMarkPopover-header" id={`${id}-header`}>
        <div className="spectrum-CoachMarkPopover-title">{title}</div>
        {!disableProgress && <div className="spectrum-CoachMarkPopover-step">{formatMessage('steps', {currentStep, totalSteps})}</div>}
      </div>
      <div className="spectrum-CoachMarkPopover-content" id={`${id}-content`}>
        {children}
      </div>
      <div className="spectrum-CoachMarkPopover-footer">
        {cancelLabel && <Button quiet onClick={onCancel} autoFocus={!confirmLabel ? autoFocus : null}>{cancelLabel}</Button>}
        {confirmLabel && <Button variant="primary" onClick={onConfirm} autoFocus={autoFocus}>{confirmLabel}</Button>}
      </div>
    </div>);
  }
}