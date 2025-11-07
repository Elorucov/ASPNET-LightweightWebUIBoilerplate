function lang(key) {
	return langKeys[key] || `%${key}%`;
}

/**
 * Returns the values of the {@link HTMLInputElement}s looked up by the space-separated list of {@link ids}.
 */
function getInputValuesByIds(ids) {
	const inputs = {};
	if (!ids) return inputs;
	for (const id of ids.split(/\s+/)) {
		const el = UI.getElement(id);
		if (!el) continue;
		inputs[el.name] = el.value;
	}
	return inputs;
}

Array.prototype.remove = function (item) {
	let index = this.indexOf(item);
	if (index == -1) return;
	this.splice(index, 1);
};

NodeList.prototype.toArray = function () {
	let arr = [];
	for (let i = 0; i < this.length; i++) arr.push(this[i]);
	return arr;
};

HTMLCollection.prototype.toArray = function () {
	let arr = [];
	for (let i = 0; i < this.length; i++) arr.push(this[i]);
	return arr;
};

HTMLElement.prototype.anim = function (keyframes, options, onFinish) {
	if (this.animate !== undefined) {
		var a = this.animate(keyframes, options);
		if (onFinish)
			a.onfinish = onFinish;
		return a;
	} else if (this.style.animationName !== undefined) {
		if (!compatAnimStyle) {
			compatAnimStyle = UI.createElement("style");
			document.body.appendChild(compatAnimStyle);
		}
		var ruleName = "";
		for (var i = 0; i < 40; i++) {
			ruleName += String.fromCharCode(0x61 + Math.floor(Math.random() * 26));
		}
		var rule = "@keyframes " + ruleName + "{";
		rule += "0%{";
		for (var k in keyframes[0]) {
			rule += cssRuleForCamelCase(k) + ": " + keyframes[0][k] + ";";
		}
		rule += "} 100%{";
		for (var k in keyframes[1]) {
			rule += cssRuleForCamelCase(k) + ": " + keyframes[1][k] + ";";
		}
		rule += "}}";
		var sheet = compatAnimStyle.sheet;
		sheet.insertRule(rule, sheet.rules.length);
		var duration = (options instanceof Number) ? options : options.duration;
		var easing = (options instanceof Number) ? "" : options.easing;
		this.style.animation = ruleName + " " + (duration / 1000) + "s " + easing;
		var fn = () => {
			this.style.animation = "";
			removeCssRuleByName(sheet, ruleName);
			if (onFinish) onFinish();
			this.removeEventListener("animationend", fn);
		};
		this.addEventListener("animationend", fn);
		return {
			cancel: () => this.style.animation = ""
		};
	}
	if (onFinish) onFinish();
	return null;
};

HTMLElement.prototype.show = function (value = "") {
	this.style.display = value;
};

HTMLElement.prototype.showAnimated = function (animation, onEnd) {
	if (!animation) {
		animation = {
			keyframes: [{
				opacity: 0
			}, {
				opacity: 1
			}],
			options: {
				duration: 200,
				easing: "ease"
			}
		};
	}
	if (this.currentVisibilityAnimation) {
		this.currentVisibilityAnimation.cancel();
	}
	this.show();
	this.currentVisibilityAnimation = this.anim(animation.keyframes, animation.options, () => {
		this.currentVisibilityAnimation = null;
		if (onEnd) onEnd();
	});
};

HTMLElement.prototype.hide = function () {
	this.style.display = "none";
};

HTMLElement.prototype.hideAnimated = function (animation, onEnd) {
	if (!animation) {
		animation = {
			keyframes: [{
				opacity: 0
			}, {
				opacity: 1
			}],
			options: {
				duration: 200,
				easing: "ease"
			}
		};
	}
	if (this.currentVisibilityAnimation) {
		this.currentVisibilityAnimation.cancel();
		this.currentVisibilityAnimation = null;
	}
	this.currentVisibilityAnimation = this.anim(animation.keyframes, animation.options, () => {
		this.hide();
		this.currentVisibilityAnimation = null;
		if (onEnd) onEnd();
	});
};

HTMLElement.prototype.isHidden = function () {
	return this.style.display === "none";
};

var UI = {
	isMobile: function () {
		return document.body.classList.contains("mobile");
	},

	toggleClass: function (element, className) {
		if (element.classList.contains(className)) {
			element.classList.remove(className);
		} else {
			element.classList.add(className);
		}
	},

	createElement: function (tag, attrs = {}, children = []) {
		let el = document.createElement(tag);
		for (let attrName in attrs) {
			el[attrName] = attrs[attrName];
		}
		for (let child of children) {
			if (child instanceof HTMLElement || child instanceof SVGSVGElement)
				el.appendChild(child);
			else
				el.appendChild(document.createTextNode(child));
		}
		return el;
	},

	getElement: function (id) {
		return document.getElementById(id);
	},

	createSVG: function (iconId, attrs = {}) {
		let size = iconId.split("_").at(-1);
		if (isNaN(parseInt(size))) throw new Error("The SVG icon's ID must end in a number.");

		let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("width", size);
		svg.setAttribute("height", size);
		for (let attrName in attrs) {
			svg.setAttribute(attrName, attrs[attrName]);
		}

		let href = document.createElementNS('http://www.w3.org/2000/svg', 'use');
		href.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `#${iconId}`);

		svg.appendChild(href);
		return svg;
	}
};

var UIForm = {
	createTextInput: function (name, label, attrs) {
		let inputAttrs = { type: "text", id: name, name: name };

		for (let attrName in attrs) {
			inputAttrs[attrName] = attrs[attrName];
		}

		return UI.createElement("div", { className: "form_item for_text_input" }, [
			UI.createElement("label", { for: name }, [ label ]),
			UI.createElement("div", { className: "form_item_value" }, [
				UI.createElement("input", inputAttrs)
			]),
		]);
	}
};

/* Layers and boxes */

class LayerManager {
	static getInstance() {
		if (!LayerManager.instance) LayerManager.instance = new LayerManager(100, true);
		return LayerManager.instance;
	}

	static getMediaInstance() {
		if (!LayerManager.mediaInstance) LayerManager.mediaInstance = new LayerManager(90, false);
		return LayerManager.mediaInstance;
	}

	constructor(baseZIndex, isDefaultInstance) {
		this.stack = [];
		this.animatingHide = false;
		this.hideAnimCanceled = false;
		this.hiddenTemporarily = false;
		this.escapeKeyListener = (ev) => {
			if (ev.keyCode == 27 && !this.hiddenTemporarily) {
				let focusedEl = document.activeElement;
				if (!focusedEl || (focusedEl.tagName != "INPUT" && focusedEl.tagName != "TEXTAREA")) {
					this.lastEscKeyEvent = ev;
					this.maybeDismissTopLayer();
				}
			}
		}

		this.baseZIndex = baseZIndex;
		this.scrim = UI.createElement("div", {
			className: "layer_scrim"
		});
		this.scrim.style.zIndex = baseZIndex.toString();
		this.scrim.hide();
		document.body.appendChild(this.scrim);

		if (isDefaultInstance) {
			this.boxLoader = UI.createElement("div", {
				id: "box_loader"
			}, [
				UI.createElement("div", {}, [
					UI.createSVG("spinner_44", { class: "spin" })
				])
			]);
			this.boxLoader.style.zIndex = baseZIndex.toString();
			this.boxLoader.hide();
			document.body.appendChild(this.boxLoader);
		}

		let container = UI.createElement("div", {
			className: "layer_container"
		});
		container.style.zIndex = (baseZIndex + 1).toString();
		container.hide();
		this.layerContainer = container;
		document.body.appendChild(container);

		window.addEventListener("resize", this.onWindowResize.bind(this));
	}

	show(layer) {
		if (this.animatingHide) {
			this.hideAnimCanceled = true;
			this.layerContainer.innerHTML = "";
		}
		if (this.hiddenTemporarily) {
			this.unhide();
			layer.hideContainerAfterDismiss = true;
		}
		let layerContent = layer.getContent();
		this.layerContainer.appendChild(layerContent);
		layer.onBeforeShow();
		this.lockPageScroll();
		if (this.stack.length == 0) {
			if (layer.wantsScrim()) this.scrim.showAnimated();
			this.layerContainer.show();
			layerContent.showAnimated(layer.getCustomAppearAnimation());
			document.body.addEventListener("keydown", this.escapeKeyListener);
		} else {
			let prevLayer = this.stack[this.stack.length - 1];
			prevLayer.getContent().hide();
			prevLayer.onHidden();
		}
		layerContent.addEventListener("click", (ev) => {
			if (ev.target == layerContent) this.maybeDismissTopLayer();
		});
		this.stack.push(layer);
		layer.onShown();
		if (this.boxLoader) this.boxLoader.hide();
		layer.updateTopOffset();
		if (this == LayerManager.mediaInstance && LayerManager.instance && LayerManager.instance.stack.length) {
			LayerManager.instance.hideTemporarily();
		}
	}

	dismiss(layer) {
		let i = this.stack.indexOf(layer);
		if (i == -1) return;

		let layerContent = layer.getContent();
		if (!layerContent.isHidden()) layer.onHidden();

		for (let callback of layer.dismissCallbacks) {
			callback();
		}

		if (i == this.stack.length - 1) {
			this.stack.pop();
			if (this.stack.length) {
				let newLayer = this.stack[this.stack.length - 1];
				newLayer.getContent().show();
				newLayer.updateTopOffset();
				newLayer.onShown();
			}
		} else {
			this.stack.splice(i, 1);
		}
		if (this.stack.length == 0) {
			document.body.removeEventListener("keydown", this.escapeKeyListener);
			let anim = layer.getCustomDismissAnimation();
			let duration = 200;
			if (anim) {
				duration = anim.options.duration;
				this.animatingHide = true;
				layerContent.hideAnimated(anim, () => {
					if (this.hideAnimCanceled) {
						this.hideAnimCanceled = false;
					} else {
						this.layerContainer.removeChild(layerContent);
						this.layerContainer.hide();
					}
					this.animatingHide = false;
				});
			} else {
				this.layerContainer.removeChild(layerContent);
				this.layerContainer.hide();
			}
			this.scrim.hideAnimated({
				keyframes: [{
					opacity: 1
				}, {
					opacity: 0
				}],
				options: {
					duration: duration,
					easing: "ease"
				}
			})
			if (this == LayerManager.mediaInstance && LayerManager.instance && LayerManager.instance.stack.length) {
				LayerManager.instance.unhide();
			}
		} else {
			this.layerContainer.removeChild(layerContent);
		}
		this.unlockPageScroll();
		if (layer.hideContainerAfterDismiss) {
			this.hideTemporarily();
		}
	}

	hideTemporarily() {
		if (this.hiddenTemporarily) return;
		this.layerContainer.hideAnimated();
		this.scrim.hideAnimated();
		this.hiddenTemporarily = true;
	}

	unhide() {
		if (!this.hiddenTemporarily) return;
		this.layerContainer.showAnimated();
		this.scrim.showAnimated();
		this.hiddenTemporarily = false;
	}

	maybeDismissTopLayer() {
		if (this == LayerManager.mediaInstance && LayerManager.instance && LayerManager.instance.stack.length && (!LayerManager.instance.hiddenTemporarily || LayerManager.instance.lastEscKeyEvent == this.lastEscKeyEvent))
			return;
		let topLayer = this.stack[this.stack.length - 1];
		if (topLayer.allowDismiss()) topLayer.dismiss();
	}

	getTopLayer() {
		if (this.stack.length == 0) return null;
		return this.stack[this.stack.length - 1];
	}

	lockPageScroll() {
		if (LayerManager.pageScrollLockCount++ == 0) {
			let scrollbarW = window.innerWidth - document.body.clientWidth;
			document.body.style.top = `-${window.scrollY}px`;
			document.body.style.position = "fixed";
			document.body.style.paddingRight = scrollbarW + "px";
			document.getElementsByTagName("main")[0].classList.add("locked");
		}
	}

	unlockPageScroll() {
		if (--LayerManager.pageScrollLockCount == 0) {
			let scrollY = document.body.style.top;
			document.body.style.position = "";
			document.body.style.top = "";
			document.body.style.paddingRight = "";
			document.getElementsByTagName("main")[0].classList.remove("locked");
			window.scrollTo(0, parseInt(scrollY || '0') * -1);
		}
	}

	showBoxLoader() {
		this.updateTopOffset(this.boxLoader);
		if (!this.boxLoader.isHidden()) return;
		this.boxLoader.style.zIndex = (this.stack.length ? (this.baseZIndex + 2) : this.baseZIndex).toString();
		this.boxLoader.showAnimated();
	}

	onWindowResize(ev) {
		for (let layer of this.stack) {
			layer.onWindowResize();
		}
		this.updateAllTopOffsets();
	}

	showSnackbar(text) {
		let snackbar = UI.createElement("div", {
			className: "snackbar_wrap"
		}, [
			UI.createElement("div", {
				className: "snackbar",
				innerHTML: text
			})
		]);
		document.body.appendChild(snackbar);
		this.updateTopOffset(snackbar);
		if (this.boxLoader) this.boxLoader.hideAnimated();
		setTimeout(() => {
			snackbar.hideAnimated({
				keyframes: [{
					opacity: 1
				}, {
					opacity: 0
				}],
				options: {
					duration: 500,
					easing: "ease"
				}
			}, () => {
				snackbar.remove();
			});
		}, 2000);
	}

	updateTopOffset(el) {
		if (UI.isMobile()) return;
		let layer = el.children[0];
		let height = layer.offsetHeight;
		layer.style.marginTop = Math.round(Math.max(0, (window.innerHeight - height) / 3 - 10)) + "px";
	}

	updateAllTopOffsets() {
		if (this.boxLoader) {
			this.updateTopOffset(this.boxLoader);
		}
		if (this.stack.length) {
			this.stack[this.stack.length - 1].updateTopOffset();
		}
	}

	dismissByID(id) {
		for (let layer of this.stack) {
			if (layer.id == id) {
				layer.dismiss();
				return true;
			}
		}
		return false;
	}

	dismissEverything() {
		if (this.boxLoader)
			this.boxLoader.hide();
		for (let i = this.stack.length - 1; i >= 0; i--) {
			this.dismiss(this.stack[i]);
		}
	}
}

LayerManager.instance = null;
LayerManager.mediaInstance = null;
LayerManager.pageScrollLockCount = 0;

class BaseLayer {
	constructor() {
		this.dismissCallbacks = [];
		this.hideContainerAfterDismiss = false;
	}

	show() {
		if (!this.content) {
			this.content = UI.createElement("div", {
				className: "layer_content"
			});
			let contentView = this.onCreateContentView();
			this.content.appendChild(contentView);
		}
		this.getLayerManager().show(this);
	}

	dismiss() {
		this.getLayerManager().dismiss(this);
	}

	getContent() {
		return this.content;
	}

	allowDismiss() {
		return true;
	}

	updateTopOffset() {
		this.getLayerManager().updateTopOffset(this.content);
	}

	onBeforeShow() { }
	onShown() { }
	onHidden() { }
	onWindowResize() { }
	wantsScrim() {
		return true;
	}
	getLayerManager() {
		return LayerManager.getInstance();
	}
}

class Box extends BaseLayer {

	constructor(title, buttonTitles = [], onButtonClick = null) {
		super();
		this.buttons = [];
		this.title = title;
		this.buttonTitles = buttonTitles;
		this.onButtonClick = onButtonClick;

		let contentWrap = UI.createElement("content", {});
		this.contentWrap = contentWrap;
	}

	onCreateContentView() {
		let content = UI.createElement("div", {
			className: "box_layer"
		}, [
			UI.createElement("div", {
				className: "box_layer_inner"
			}, [
				this.titleBar = UI.createElement("header", {}, [
					UI.createElement("span", {
						innerText: this.title
					})
				]),
				this.getRawContentWrap(),
				this.buttonBar = UI.createElement("footer", {})
			])
		]);
		if (!this.title) this.titleBar.hide();

		if (this.closeable) {
			this.closeButton = UI.createElement("button", {
				title: lang("delete"),
				type: "button",
				onclick: (ev) => {
					ev.preventDefault();
					this.dismiss();
				}
			}, [
				UI.createSVG(UI.isMobile() ? "cancel_28" : "cancel_20")
			])
			this.titleBar.appendChild(this.closeButton);
		}
		this.updateButtonBar();
		this.boxLayer = content;

		return content;
	}

	getRawContentWrap() {
		return this.contentWrap;
	}

	setContent(content) {
		if (this.contentWrap.hasChildNodes) {
			for (let i = 0; i < this.contentWrap.children.length; i++) this.contentWrap.firstChild.remove();
		}
		this.contentWrap.appendChild(content);
		if (this.boxLayer) LayerManager.instance.updateTopOffset(this.getContent());
	}

	getButton(index) {
		return this.buttons[index];
	}

	setButtons(buttonTitles, onButtonClick) {
		this.buttonTitles = buttonTitles;
		this.onButtonClick = onButtonClick;
		this.updateButtonBar();
	}

	setCloseable(closeable) {
		this.closeable = closeable;
	}

	allowDismiss() {
		return this.closeable;
	}

	getCustomDismissAnimation() {
		if (UI.isMobile()) {
			return {
				keyframes: [{
					transform: "translateY(0)"
				}, {
					transform: "translateY(100%)"
				}],
				options: {
					duration: 300,
					easing: "cubic-bezier(0.32, 0, 0.67, 0)"
				}
			};
		}
		return {
			keyframes: [{
				opacity: 1,
				transform: "scale(1)"
			}, {
				opacity: 0,
				transform: "scale(0.95)"
			}],
			options: {
				duration: 200,
				easing: "ease"
			}
		};
	}

	getCustomAppearAnimation() {
		if (UI.isMobile()) {
			let height = this.boxLayer.offsetHeight + 32;
			return {
				keyframes: [{
					transform: "translateY(" + height + "px)"
				}, {
					transform: "translateY(0)"
				}],
				options: {
					duration: 600,
					easing: "cubic-bezier(0.22, 1, 0.36, 1)"
				}
			};
		}
		return {
			keyframes: [{
				opacity: 0,
				transform: "scale(0.9)"
			}, {
				opacity: 1,
				transform: "scale(1)"
			}],
			options: {
				duration: 300,
				easing: "ease"
			}
		};
	}

	updateButtonBar() {
		for (let button of this.buttons) {
			button.remove();
		}
		this.buttons = [];
		if (this.buttonTitles.length) {
			this.buttonBar.show();
			for (let i = 0; i < this.buttonTitles.length; i++) {
				let btn = UI.createElement("button", {
					type: "button"
				});
				btn.innerText = this.buttonTitles[i];
				if (i == 0 && !this.noPrimaryButton) {
					btn.className = "primary";
				}
				if (this.onButtonClick) {
					btn.onclick = this.onButtonClick.bind(this, i);
				} else {
					btn.onclick = this.dismiss.bind(this);
				}
				this.buttonBar.appendChild(btn);
				this.buttons.push(btn);
			}
		} else {
			this.buttonBar.hide();
		}
	}

	dismiss() {
		super.dismiss();
		if (this.onDismissListener) this.onDismissListener();
	}

	setOnDismissListener(listener) {
		this.onDismissListener = listener;
	}

	showButtonLoading(index, loading) {
		if (UI.isMobile()) {
			let cl = this.getButton(index).classList;
			if (loading)
				cl.add("loading");
			else
				cl.remove("loading");
		} else {
			if (loading) {
				if (!this.buttonBarLoader) {
					this.buttonBarLoader = UI.createElement("div", {
						className: "button_bar_aux"
					}, [UI.createSVG("spinner_20", { class: "loader spin" })]);
					if (this.buttonBar.firstChild)
						this.buttonBar.insertBefore(this.buttonBarLoader, this.buttonBar.firstChild);
					else
						this.buttonBar.appendChild(this.buttonBarLoader);
				} else {
					this.buttonBarLoader.show();
				}
			} else if (this.buttonBarLoader) {
				this.buttonBarLoader.hide();
			}
		}
	}

	addButtonBarAuxHTML(html) {
		let aux = UI.createElement("div", {
			className: "button_bar_aux",
			innerHTML: html
		});
		this.buttonBar.insertBefore(aux, this.buttonBar.firstChild);
	}
}

class BoxWithoutContentPadding extends Box {
	constructor(title, buttonTitles, onButtonClick) {
		super(title, buttonTitles, onButtonClick);
		this.contentWrap.style.padding = "0";
	}
}

class BaseScrollableBox extends BoxWithoutContentPadding {;
	constructor(title, buttonTitles, onButtonClick) {
		super(title, buttonTitles, onButtonClick);
		this.scrollAtTop = true;
		this.scrollAtBottom = false;

	}

	wrapScrollableElement(el) {
		this.scrollableEl = el;
		el.addEventListener("scroll", this.onContentScroll.bind(this), { passive: true });
		var shadowTop;

		this.contentWrapWrap = UI.createElement("div", { className: "scrollable_shadow_wrap scroll_at_top" }, [
			shadowTop = UI.createElement("div", { className: "shadow_top" }),
			UI.createElement("div", { className: "shadow_bottom" })
		]);
		// el.insertBefore(this.contentWrapWrap, el);
		this.contentWrapWrap.insertBefore(el, shadowTop);
		return this.contentWrapWrap;
	}

	onContentScroll(ev) {
		var atTop = this.scrollableEl.scrollTop == 0;
		var atBottom = this.scrollableEl.scrollTop >= this.scrollableEl.scrollHeight - this.scrollableEl.offsetHeight;
		if (this.scrollAtTop != atTop) {
			this.scrollAtTop = atTop;
			if (atTop)
				this.contentWrapWrap.classList.add("scroll_at_top");
			else
				this.contentWrapWrap.classList.remove("scroll_at_top");
		}
		if (this.scrollAtBottom != atBottom) {
			this.scrollAtBottom = atBottom;
			if (atBottom)
				this.contentWrapWrap.classList.add("scroll_at_bottom");
			else
				this.contentWrapWrap.classList.remove("scroll_at_bottom");
		}
	}

	onShown() {
		super.onShown();
		this.onContentScroll(null);
	}
}

class ScrollableBox extends BaseScrollableBox {
	constructor(title, buttonTitles, onButtonClick) {
		super(title, buttonTitles, onButtonClick);
	}

	onCreateContentView() {
		var cont = super.onCreateContentView();
		cont.classList.add("scrollable");
		return cont;
	}

	getRawContentWrap() {
		return this.wrapScrollableElement(this.contentWrap);
	}
}

class ConfirmBox extends Box {
	constructor(title, message, onConfirmed, buttonTitles = null) {
		super(title, buttonTitles || [lang("Yes"), lang("No")], function (idx) {
			if (idx == 0) {
				onConfirmed();
			} else {
				this.dismiss();
			}
		});
		var content = UI.createElement("div", { innerHTML: message });
		this.setContent(content);
	}

	onShown() {
		super.onShown();
		if (this.buttons.length > 0) {
			this.buttons[0].focus();
		}
	}
}

class MessageBox extends Box {
	constructor(title, message, button) {
		super(title, [button]);
		var content = UI.createElement("div", { innerHTML: message });
		this.setContent(content);
	}
}

class FormBox extends Box {
	constructor(title, content, button, act) {
		super(title, [button, lang("Cancel")], function (idx) {
			if (idx == 0) {
				this.submitForm();
			} else {
				this.dismiss();
			}
		});
		if (content instanceof HTMLElement) {
			this.form = UI.createElement("form", { action: act, method: "post" }, [content]);
		} else if (content instanceof Array) {
			this.form = UI.createElement("form", { action: act, method: "post" }, [...content]);
		} else {
			this.form = UI.createElement("form", { innerHTML: content, action: act, method: "post" });
		}
		this.form.onsubmit = (ev) => {
			ev.preventDefault();
			this.submitForm();
		};
		this.setContent(this.form);
	}

	submitForm() {
		if (this.form.reportValidity()) {
			let btn = this.getButton(0);
			btn.setAttribute("disabled", "");
			this.getButton(1).setAttribute("disabled", "");
			this.showButtonLoading(0, true);
			Ajax.submitForm(this.form, (resp) => {
				if (resp) {
					this.dismiss();
				} else {
					var btn = this.getButton(0);
					btn.removeAttribute("disabled");
					this.getButton(1).removeAttribute("disabled");
					this.showButtonLoading(0, false);
				}
			});
		}
	}

	onCreateContentView() {
		var cont = super.onCreateContentView();
		return cont;
	}
}

/* Network-related */

function addParamsToURL(url, params) {
	var paramsParts = [];
	for (var key in params) {
		var part = encodeURIComponent(key);
		if (params[key])
			part += '=' + encodeURIComponent(params[key]);
		paramsParts.push(part);
	}
	var fragment = "";
	if (url.indexOf('#') != -1) {
		var parts = url.split("#", 2);
		url = parts[0];
		fragment = '#' + parts[1];
	}
	return url + (url.indexOf('?') == -1 ? '?' : '&') + paramsParts.join('&') + fragment;
}

function applyServerCommand(command) {
	switch (command.type) {
		case "redirect":
			location.href = command.uri;
			break;
		case "eval":
			eval(command.code);
			break;
		case "insert":
			UI.getElement(command.elementId).innerHTML = command.content;
			break;
		case "snackbar":
			LayerManager.getInstance().showSnackbar(command.content);
			break;
		case "message_box":
			new MessageBox(command.title, command.content, command.boxButton).show();
			break;
		case "form_box":
			let fBox = new FormBox(command.title, command.content, command.boxButton, command.action);
			fBox.show();
			if (command.boxWidth) {
				(fBox.getContent().querySelector(".box_layer")).style.width = command.boxWidth + "px";
				(fBox.getContent().querySelector(".box_layer")).style.minWidth = command.boxWidth + "px";
			}
			break;
		case "box":
			{
				let box = command.scrollable ? new ScrollableBox(command.title, [lang("Close")]) : new BoxWithoutContentPadding(command.title);
				let cont = UI.createElement("div");
				if (command.boxId) {
					cont.id = command.boxId;
					box.id = command.boxId;
				}
				cont.innerHTML = command.content;
				cont.customData = { box: box };
				box.setContent(cont);
				box.show();
				if (command.boxWidth) {
					(box.getContent().querySelector(".box_layer")).style.width = command.boxWidth + "px";
					(box.getContent().querySelector(".box_layer")).style.minWidth = command.boxWidth + "px";
				}
				if (command.boxAux) {
					box.addButtonBarAuxHTML(command.boxAux);
				}
			}
			break;
	}
}

var submittingForm = null;
var Ajax = {
	get: function (uri, onDone, onError, responseType = "json") {
		if (!onError) {
			onError = (msg) => {
				new MessageBox(lang("Error"), msg || lang("NetworkError"), lang("Close")).show();
			};
		}
		let xhr = new XMLHttpRequest();
		xhr.open("GET", addParamsToURL(uri, { _ajax: "1" }));
		xhr.onload = function () {
			if (Math.floor(xhr.status / 100) == 2) {
				try {
					var parsedResponse = responseType == "json" ? JSON.parse(xhr.response) : xhr.response;
					onDone(parsedResponse);
				} catch (e) {
					console.error(e);
					onError(null);
				}
			} else {
				if (xhr.response && responseType == "json" && xhr.getResponseHeader("content-type") == "application/json") {
					try {
						onDone(JSON.parse(xhr.response));
					} catch (e) {
						console.error(e);
						onError(null);
					}
				} else {
					onError(xhr.response || xhr.statusText);
				}
			}
		};
		xhr.onerror = function (ev) {
			console.log(ev);
			onError(xhr.statusText);
		};
		xhr.send();
		return xhr;
	},

	getAndApplyActions: function (url, onDone = null, onError = null, onBeforeDone = null) {
		return Ajax.get(url, function (resp) {
			if (onBeforeDone) onBeforeDone();
			if (resp instanceof Array) {
				for (let i = 0; i < resp.length; i++) {
					applyServerCommand(resp[i]);
				}
			}
			if (onDone) onDone();
		}, function (message) {
			new MessageBox(lang("Error"), message || lang("NetworkError"), lang("Close")).show();
			if (onError) onError();
		});
	},

	post: function (uri, params, onDone, onError, responseType = "json") {
		let xhr = new XMLHttpRequest();
		xhr.open("POST", uri);
		xhr.setRequestHeader("XSRF", config.xsrf);
		xhr.onload = function () {
			if (Math.floor(xhr.status / 100) == 2) {
				try {
					var parsedResponse = responseType == "json" ? JSON.parse(xhr.response) : xhr.response;
					onDone(parsedResponse);
				} catch (e) {
					console.error(e);
					onError(null);
				}
			} else {
				onError(xhr.response || xhr.statusText);
			}
		};
		xhr.onerror = function (ev) {
			console.log(ev);
			onError();
		};
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		let formData = [];
		for (let key in params) {
			let val = params[key];
			if (val instanceof Array) {
				for (var e of val) {
					formData.push(key + "=" + encodeURIComponent(e));
				}
			} else {
				formData.push(key + "=" + encodeURIComponent(params[key]));
			}
		}
		formData.push("_ajax=1");
		xhr.send(formData.join("&"));
		return xhr;
	},

	postAndApplyActions: function (uri, params, onDone, onError, showDefaultErrorBox = false) {
		params.xsrf = config.xsrf;
		Ajax.post(uri, params, (resp) => {
			if (resp instanceof Array) {
				for (var i = 0; i < resp.length; i++) applyServerCommand(resp[i]);
			}
			if (onDone) onDone();
		}, () => {
			if (onError) onError();
			if (!onError || showDefaultErrorBox)
				new MessageBox(lang("Error"), lang("NetworkError"), lang("Close")).show();
		});
	},

	submitForm: function (form, onDone = null, submitter = null, extra = {}) {
		if (submittingForm) return false;
		if (!form.checkValidity()) return false;
		if (submitter && submitter.dataset.confirmMessage && !extra.confirmed) {
			const confirmedExtra = Object.assign({}, extra);
			confirmedExtra.confirmed = true;
			new ConfirmBox(lang(submitter.dataset.confirmTitle), lang(submitter.dataset.confirmMessage), () => ajaxSubmitForm(form, onDone, submitter, confirmedExtra)).show();
			return;
		}
		submittingForm = form;
		if (!submitter && form.dataset.submitterId) submitter = ge(form.dataset.submitterId);
		if (submitter) submitter.classList.add("loading");

		let data = {};
		let elems = form.elements;
		for (let i = 0; i < elems.length; i++) {
			let el = elems[i];
			if (!el.name)
				continue;
			if (((el.tagName == "input" && el.type == "submit") || el.tagName == "button") && el != submitter)
				continue;
			if ((el.type != "radio" && el.type != "checkbox") || ((el.type == "radio" || el.type == "checkbox") && el.checked)) {
				if (data[el.name]) {
					let existing = data[el.name];
					if (existing instanceof Array)
						(existing).push(el.value);
					else
						data[el.name] = [existing, el.value];
				} else {
					data[el.name] = el.value;
				}
			}
		}
		if (extra.additionalInputs) Object.assign(data, extra.additionalInputs);
		Ajax.post(form.action, data, function (resp) {
			if (extra.onResponseReceived) {
				extra.onResponseReceived(resp);
			}
			submittingForm = null;
			if (submitter)
				submitter.classList.remove("loading");
			var dismiss = true;
			if (resp instanceof Array) {
				for (var i = 0; i < resp.length; i++) {
					if (resp[i].type == "dismiss") {
						dismiss = false;
					} else {
						applyServerCommand(resp[i]);
					}
				}
			}
			if (onDone) onDone(dismiss);
		}, function (msg) {
			submittingForm = null;
			if (submitter)
				submitter.classList.remove("loading");
			if (msg && msg[0] == '[') {
				var resp = JSON.parse(msg);
				for (var i = 0; i < resp.length; i++) {
					applyServerCommand(resp[i]);
				}
			} else {
				new MessageBox(lang("Error"), msg || lang("NetworkError"), lang("Close")).show();
			}
			if (onDone) onDone(false);
		});
		return false;
	},

	confirm: function (titleKey, messageKey, url, params = {}, useLang = true, confirmButtonTitle = null) {
		let box;
		box = new ConfirmBox(useLang ? lang(titleKey) : titleKey, useLang ? lang(messageKey) : messageKey, function () {
			var btn = box.getButton(0);
			btn.setAttribute("disabled", "");
			box.getButton(1).setAttribute("disabled", "");
			btn.classList.add("loading");
			Ajax.post(url, params, function (resp) {
				box.dismiss();
				if (resp instanceof Array) {
					for (var i = 0; i < resp.length; i++) {
						applyServerCommand(resp[i]);
					}
				}
			}, function (msg) {
				box.dismiss();
				new MessageBox(lang("Error"), msg || lang("NetworkError"), lang("Close")).show();
			});
		}, confirmButtonTitle ? [useLang ? lang(confirmButtonTitle) : confirmButtonTitle, lang("Cancel")] : null);
		box.show();
		return false;
	},

	followLink: function (link) {
		let ev = window.event;
		if (ev && (ev instanceof MouseEvent || ev instanceof KeyboardEvent) && (ev.altKey || ev.ctrlKey || ev.shiftKey || ev.metaKey)) return false;

		if (link.dataset.ajaxBox != undefined) {
			LayerManager.getInstance().showBoxLoader();
			Ajax.getAndApplyActions(link.href);
			return true;
		}
		if (link.dataset.confirmAction) {
			let params = getInputValuesByIds(link.dataset.additionalInputs);
			Ajax.confirm(link.dataset.confirmTitle, link.dataset.confirmMessage, link.dataset.confirmAction, params, false, link.dataset.confirmButton);
			return true;
		}

		return false;
	}
};

var supportsFormSubmitter = window.SubmitEvent !== undefined;

document.addEventListener("DOMContentLoaded", () => {
	document.body.addEventListener("click", function (ev) {
		var el = ev.target;
		if (((el.tagName == "input" && el.type == "submit") || el.tagName == "button") && !supportsFormSubmitter) {
			var form = el.form;
			if (!form.customData) form.customData = {};
			form.customData.lastSubmitter = el;
		}
		do {
			if (el.tagName == "A") {
				if (Ajax.followLink(el)) ev.preventDefault();
				return;
			}
			el = el.parentElement;
		} while (el && el.tagName != "body");
	}, false);
});