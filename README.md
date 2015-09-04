DockIt
================================

Zepto and jQuery Plugin to dock / stick any content with advanced options

Demo :
---------

[GH Page](http://oxydesign.github.io/DockIt/)

Options :
---------


	scrollDown           Default : false        Type : boolean      Dock when the element goes out by top
	scrollUp             Default : false        Type : boolean      Dock when the element goes out by bottom
	dockToTopFrom        Default : false        Type : number       Dock to top when this value (in px) is reached by scroll
	dockToBottomFrom     Default : false        Type : number       Dock to bottom when this value (in px) is reached by scroll
	stopDockFrom         Default : false        Type : number       Stop docking when the scroll is equal to this value (in px) or more
	stopDockBefore       Default : false        Type : number       Stop docking when the scroll is equal to this value (in px) or less
	marginT              Default : 10           Type : number       Margin to add on top before docking (on scrollDown)
	marginB              Default : 10           Type : number       Margin to add on bottom before docking (on scrollUp)
	dockedClass          Default : 'docked'     Type : string       Class name added to the element when is docked
	zIndex               Default : 'auto'       Type : number       Z-index added to the element when is docked
	onInit               Default : false        Type : function     Function invoked when the Plugin is turned on
	onStop               Default : false        Type : function     Function invoked when the Plugin is turned off
	onDock               Default : false        Type : function     Function invoked when the element is docked
	onUndock             Default : false        Type : function     Function invoked when the element is undocked