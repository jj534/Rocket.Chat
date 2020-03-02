import { Blaze } from 'meteor/blaze';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './alerts.html';

export const alerts = {
	renderedAlert: null,
	open(config) {
		this.close(false);

		config.closable = typeof config.closable === typeof true ? config.closable : true;

		if (config.timer) {
			this.timer = setTimeout(() => this.close(), config.timer);
		}

		Meteor.startup(() => {
			const alertAnchor = document.getElementById('alert-anchor');
			this.renderedAlert = Blaze.renderWithData(Template.alerts, config, alertAnchor.parentElement, alertAnchor);
		});
	},
	close(dismiss = true) {
		if (this.timer) {
			clearTimeout(this.timer);
			delete this.timer;
		}
		if (!this.renderedAlert) {
			return false;
		}

		Blaze.remove(this.renderedAlert);

		const { activeElement } = this.renderedAlert.dataVar.curValue;
		if (activeElement) {
			$(activeElement).removeClass('active');
		}

		dismiss && this.renderedAlert.dataVar.curValue.onClose && this.renderedAlert.dataVar.curValue.onClose();
	},
};

Template.alerts.helpers({
	hasAction() {
		return Template.instance().data.action ? 'rc-alerts--has-action' : '';
	},
	modifiers() {
		return (Template.instance().data.modifiers || []).map((mod) => `rc-alerts--${ mod }`).join(' ');
	},
});

Template.alerts.onRendered(function() {
	if (this.data.onRendered) {
		this.data.onRendered();
	}
});

Template.alerts.onDestroyed(function() {
	if (this.data.onDestroyed) {
		this.data.onDestroyed();
	}
});

Template.alerts.events({
	'click .js-action'(e, instance) {
		if (!this.action) {
			return;
		}
		this.action.call(this, e, instance.data.data);
	},
	'click .js-close'() {
		alerts.close();
	},
});

Template.alerts.helpers({
	isSafariIos: /iP(ad|hone|od).+Version\/[\d\.]+.*Safari/i.test(navigator.userAgent),
});
