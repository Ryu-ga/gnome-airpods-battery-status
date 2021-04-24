/**
 * Forked from gnome-airpods-battery-status by Julien "delphiki" Villetorte (delphiki@protonmail.com)
 */
const Main = imports.ui.main;
const Clutter = imports.gi.Clutter;
const GLib = imports.gi.GLib;
const St = imports.gi.St;
const Gio = imports.gi.Gio;
const ByteArray = imports.byteArray;
const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let batteryStatus;
let statusFilePath = '/tmp/budstatus.out';

class BudsBatteryStatus {
	constructor(menu, filePath) {
		this._menu = menu;
		this._statusFilePath = filePath;
		this._box = new St.BoxLayout();

        	this._currentStatusValue = {};
        	this._timeout = null;
		this._leftBudLabel = null;
        	this._rightBudLabel = null;
        	this._icon = null;
       		this._caseLabel = null;
        	this._caseIcon = null;

        	this.buildLayout();
	}

	getCurrentStatus() {
        	if (!GLib.file_test(this._statusFilePath, GLib.FileTest.EXISTS)) {
            	return {};
        	}

        	let fileContents = GLib.file_get_contents(this._statusFilePath)[1];

        	let lines;
        	if (fileContents instanceof Uint8Array) {
            		lines = ByteArray.toString(fileContents).trim().split('\n');
        	} else {
            		lines = fileContents.toString().trim().split('\n');
        	}

        	let lastLine = lines[lines.length - 1];

       		return lastLine.length > 0 ? JSON.parse(lastLine) : {};
    	}

	updateBatteryStatus() {
		this._currentStatusValue = this.getCurrentStatus();

		let payload = this._currentStatusValue.hasOwnProperty('payload') ? this._currentStatusValue.payload : {};
		if (payload == null) payload = {};
		let leftcharge = payload.hasOwnProperty('batt_left') ? payload.batt_left : null;
		let rightcharge = payload.hasOwnProperty('batt_right') ? payload.batt_right : null;
		let casecharge = payload.hasOwnProperty('batt_case') ? payload.batt_case : null;

		if (leftcharge !== null) {
			this._leftBudLabel.set_text(leftcharge+' %');
		} else {
			this._leftBudLabel.set_text('- %');
		}
		
		if (rightcharge !== null) {
			this._rightBudLabel.set_text(rightcharge+' %');
		} else {
			this._rightBudLabel.set_text('- %');
		}

		if (casecharge !== null && (payload.placement_left == 3 || payload.placement_right == 3) ) {
			this._caseLabel.set_text(casecharge+' %');
			this._caseLabel.show();
			this._caseIcon.show();
		} else {
			this._caseLabel.hide();
			this._caseIcon.hide();
		}

		return true;
	}

	buildLayout() {
        	this._leftBudLabel = new St.Label({
            		text: '- %',
            		y_align: Clutter.ActorAlign.CENTER,
            		style_class: "left-airpod-label"
        	});

        	this._icon = new St.Icon({
            		gicon: Gio.icon_new_for_string(Me.path + '/airpods.svg'),
            		style_class: "system-status-icon",
        	});

        	this._rightBudLabel = new St.Label({
            		text: '- %',
            		y_align: Clutter.ActorAlign.CENTER,
            		style_class: "right-airpod-label"
        	});

        	this._caseIcon = new St.Icon({
            		gicon: Gio.icon_new_for_string(Me.path + '/case.svg'),
            		style_class: "system-status-icon",
        	});

        	this._caseLabel = new St.Label({
            		text: '- %',
            		y_align: Clutter.ActorAlign.CENTER,
            		style_class: "right-airpod-label"
        	});

        	this._box.add(this._leftBudLabel)
        	this._box.add(this._icon);
       		this._box.add(this._rightBudLabel);
        	this._box.add(this._caseIcon);
        	this._box.add(this._caseLabel);
	}

	enable() {
		this._menu.insert_child_at_index(this._box, 0);

		let self = this;
		this._timeout = Mainloop.timeout_add_seconds(2, function() {
			return self.updateBatteryStatus();
		});
	}

	disable() {
		this._menu.remove_child(this._box);
		Mainloop.source_remove(this._timeout);
	}
}

function enable() {
	let menu = Main.panel.statusArea["aggregateMenu"]._power;
	batteryStatus = new BudsBatteryStatus(menu, statusFilePath);
	batteryStatus.enable();
}

function disable() {
	batteryStatus.disable();
	batteryStatus = null;
}

let Log = function(msg) {
    log("[Buds Battery Status] " + msg);
}
