/**
 * @name InterFaceTools Library
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.1.1
 */

function makeCursor(name, x, y, z){
	var c = new CUCursor();
	c.init();
	c.cells.x = x;
	c.cells.y = y;
	c.cells.z = z;
	c.range(x, y, z);
	c.name = name;
	return c;
}

var CUCursor = function(){return;};

CUCursor.prototype = {
	init: function(){
		this.pos = {x: 0, y: 0, z: 0};
		this.pos_pre = {x: 0, y:0, z: 0};
		this.cells = {x: 0, y: 0, z: 0};
		this.looped = {x: 0, y: 0, z: 0};
		this.outside = {x: 0, y: 0, z: 0};
		this.disablePos = [];
		this.cellReturn = true;
		this.name = 'cursor';
		this.index = 0;
		this.ranged = {x: 0, y: 0, z: 0};
		this.offsetted = {x: 0, y: 0, z: 0};
		this.rangeovered = {x: 0, y: 0, z: 0}; //未使用？
	},
	
	resize: function(x, y, z){
		this.cells.x = x;
		this.cells.y = y;
		this.cells.z = z;
	},
	
	right: function(num)
	{
		num = num == null ? 1 : num;
		this.move(num, 0, 0);
	},
	left: function(num)
	{
		num = num == null ? 1 : num;
		this.move(-num, 0, 0);
	},
	up: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, -num, 0);
	},
	down: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, num, 0);
	},
	front: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, 0, num);
	},
	back: function(num)
	{
		num = num == null ? 1 : num;
		this.move(0, 0, -num);
	},
	
	disable: function(x, y, z){
		var pos = this.disablePos;
		if(this.isEnable(x, y, z)){
			return;
		}
		pos.push(this.makePositionStr(x, y, z).join(' '));
	},
	
	enable: function(x, y, z){
		var pos = this.disablePos, i, str = this.makePositionStr(x, y, z);;
		for(i = 0; i < pos.length; i++){
			if(pos[i] == str){
				pos.splice(i, 1);
			}
		}
	},
	
	range: function(x, y, z){
		x = x == null ? 1 : x;
		y = y == null ? 1 : y;
		z = z == null ? 1 : z;
		
		this.ranged = {x: x, y: y, z: z};
	},
	
	isEnable: function(x, y, z){
		var pos = this.disablePos, i, str = this.makePositionStr(x, y, z);
		for(i = 0; i < pos.length; i++){
			if(pos[i] == str){
				return false;
			}
		}
		return true; 
	},
	
	valueOf: function(valueArray){
		var i = this.index
			, vala = []
			, func = function(a){
				if(a instanceof Array){
					a.forEach(func);
					return;
				}
				vala.push(a);
				return;
			}
		;
		
		if(!(valueArray instanceof Array)){
			return null;
		}
		valueArray.forEach(func);
		
		return vala[i];
	},
	
	makePositionStr: function(x, y, z){
		var a = [];
		if(x != null){
			a.push(x);
		}
		if(y != null){
			a.push(y);
		}
		if(z != null){
			a.push(z);
		}
		return a.join(' ');
	},
	
	//他のカーソル切替時、isLoopedと組み合わせる
	out: function()
	{
//		this.pos[axis] = this.cells[axis];
		this.outside = {x: this.looped.x, y: this.looped.y, z: this.looped.z}
		return this.outside;
	},
	in: function(outside)
	{
		var cells = this.cells, a, pos = this.pos;
		for(a in pos){
			if(outside[a] > 0){
				pos[a] = 0;
			}else if(outside[a] < 0){
				pos[a] = cells[a] - 1;
			}
		}
	},

	move: function(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped
//		, keys = Object.keys(pos), a
		, a, id
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in pos){
			pre[a] = pos[a];
			pos[a] += nums[a];
			if(pos[a] >= cells[a]){
				loop[a] = pos[a] - cells[a] + 1;
				pos[a] = pos[a] % cells[a];
			}else if(pos[a] < 0){
				loop[a] = pos[a];
				//-pos
				pos[a] = (cells[a] + pos[a]) % cells[a];
			}else{
				loop[a] = 0;
			}
		}
		
		this.index = pos.x + (pos.y * cells.x) + (pos.z * cells.x * cells.y);
		this.rangeOverCheck();
	},
	
	moveTo: function(x, y, z)
	{
		var pos = this.pos, pre = this.pos_pre, cells = this.cells
		, loop = this.looped
		, a
		, nums = {x: (x == null ? 0 : x), y: (y == null ? 0 : y), z: (z == null ? 0 : z)};
		
		for(a in pos){
			pre[a] = pos[a];
			pos[a] = nums[a];
			if(pos[a] >= cells[a]){
				loop[a]++;
				pos[a] = pos[a] % cells[a];
			}else if(pos[a] < 0){
				loop[a]--;
				pos[a] = (cells[a] + pos[a]) % cells[a];
			}else{
				loop[a] = 0;
			}
		}
		this.index = pos.x + (pos.y * cells.x) + (pos.z * cells.x * cells.y);
		this.rangeOverCheck();
	},
	
	rangeOverCheck: function()
	{
		var r = this.ranged, o = this.offsetted
			, p = this.pos, over = this.rangeovered, a
		;
		for(a in p){
			over[a] = p[a] - o[a];
			if(over[a] >= r[a]){
				o[a] = 1 + p[a] - r[a];
			}else if(over[a] < 0){
				o[a] = p[a];
			}
		}
	},
	
	isRangeOver: function(axis)
	{
		var over = this.rangeovered;
		if(axis != null){
			return over.x == 0 && over.y == 0 && over.z == 0;
		}
		if(over[axis] != false){
			return over[axis] != 0;
		}
		return null;
	},
	
	isLooped: function(axis)
	{
		if(axis == null){
			return this.looped;
		}
		if(this.looped[axis] != null){
			return this.looped[axis];
		}
		return null;
	}
	
	
};

function makeSceneOrder(order){
	var s = new SceneOrder();
	s.init(order);
	return s;
}
function SceneOrder(){return;}
SceneOrder.prototype = {
	init: function(order){
		this.name = order.name;
		this.duration = order.duration;
		this.count = order.count;
		this.remove = order.remove;
		this.params = order.params;
		this.trigger = order.trigger;
	},
	isFirst: function(){
		return this.count == 0;
	},
	isLast: function(){
		return this.count >= this.duration - 1;
	}
	
};

function makeScene(){
	var s = new SceneTransition();
	s.init();
	return s;
}
function SceneTransition(){return;}
SceneTransition.prototype = {
	init: function(){
		this.transitionClock = 0;
		this.sceneOrder = [];
		this.scenePrevious = null;
		this.sceneCurrent = null;
//		this.triggerScene = null;
		
		this.nullFunc = function(info){
			return false;
		};
		
	},
	
	makeParams: function(funcName, duration, params, count, remove){
		count = count == null ? 0 : count;
		remove = remove == null ? false : remove;
		if(typeof funcName == 'object' && funcName != null){
			return funcName;
		}
		var res = {name: funcName, duration: duration, count: count, remove: remove, params: params, trigger: null};
		return makeSceneOrder(res);
	},
	
	find: function(name, inIndex){
		var f;
//		inIndex = inIndex == null ? 0 : inIndex;
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			return this.sceneCurrent;
		}
		f = this.sceneOrder.reverse().find(function(a){
			return a.name == name;
		});
		
		this.sceneOrder.reverse();
		return f;
//		return f[inIndex];
	},
	
		
	indexOf: function(name, inIndex){
		var i = -1;
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			return this.sceneCurrent;
		}
		this.sceneOrder.reverse().find(function(a){
			i++;
			return a.name == name;
		});
		
		this.sceneOrder.reverse();
		return i;
	},

	current: function(name){
		var rem, current;
		if(name){
			rem = this.removeOrder(name);
			if(rem != null){
				this.scenePrevious = this.sceneCurrent;
				current = this.sceneCurrent;
				if(current == null){
					return rem;
				}
				this.sceneOrder.unshift({name: current.name, duration: current.duration, count: current.count, params: current.params});
				this.sceneCurrent = rem;
			}
		}
		return this.sceneCurrent;
	},
	
	last: function(){
		var current = this.sceneCurrent
			, order = this.sceneOrder
		;
		if(current != null){
			return current;
		}
		if(order.length > 0){
			return order[order.length - 1];
		}
		return false;
	},
	
	sumDuration: function(){
		var s = 0;
		this.sceneOrder.forEach(function(a){
			s += a.duration;
		});
		if(this.currentOrder != null){
			s += this.currentOrder.duration - this.currentOrder.count;
		}
		return s;
	},
	
//	pushOrder: function(funcName, duration, params){
	pushOrder: function(funcName, duration, params){
		params = params == null ? {} : params;
		this.sceneOrder.push(this.makeParams(funcName, duration, params));
	},
	
	pushOrderFunc: function(funcName, duration, params){
		params = params == null ? {} : params;
		this.sceneOrder.push(this.makeParams(funcName, duration, params));
	},
	
	unshiftOrder: function(funcName, duration, params){
		var current = this.sceneCurrent;
		params = params == null ? {} : params;
		if(current != null){
			this.sceneCurrent = null;
			this.sceneOrder.unshift(this.makeParams(current.name, current.duration, current.params, current.count));
			this.sceneOrder.unshift(this.makeParams(funcName, duration, params));
		}else{
//			this.sceneOrder.unshift({name: funcName, duration: duration, count: 0, params: params});
			this.sceneOrder.unshift(this.makeParams(funcName, duration, params));
		}
	},
	
	removeCurrentOrder: function(){
		var current = this.sceneCurrent;
		if(current != null){
			//即消し
			current.remove = true;
			this.scenePrevious = current;
			this.sceneCurrent = null;
		}else if(this.sceneOrder.length > 0){
			//予約する
			this.sceneOrder[0].remove = true;
		}

	},
	
	removeOrder: function(name){
		var res = null;
		if(name == null){
			res = this.sceneOrder.slice();
			this.sceneOrder = [];
			this.sceneCurrent = null;
			return res;
		}
		
		//TODO 重複対応するか
		this.sceneOrder = this.sceneOrder.filter(function(a){
			if(a.name == name){
				res = a;
			}
			return a.name != name;
		});
		
		if(this.sceneCurrent != null && this.sceneCurrent.name == name){
			res = this.sceneCurrent;
			this.sceneCurrent = null;
			return res;
		}

		return res;
//		return {order: [], current: null};
	},
	
	setTrigger: function(scene, funcName, index)
	{
		var attach = this.last();
		if(attach == false){
			return false;
		}
		attach.trigger = scene;
//		this.triggerScene = scene;
	},
	
	transition: function(caller){
		var order = this.sceneOrder
			, current = this.sceneCurrent
		;
		if(current == null && order.length == 0){
			return;
		}
//		if(this.triggerScene != null){
//			this.triggerScene = this.triggerScene.remove ? null : this.triggerScene;
//			return;
//		}
		
		current = current == null ? order.shift() : current;
		this.sceneCurrent = current;

		if(current.trigger != null){
			current.trigger = current.trigger.remove ? null : current.trigger;
			return;
		}
		
		if((current.name != null && caller[current.name](current)) || current.remove){
			this.removeCurrentOrder();
		}
		current.count++;
		if(current.duration > 0 && current.duration <= current.count){
			this.removeCurrentOrder();
			return;
		}
		
	},
};

var SPRITEANM_DELIMITER = '][';
var SPRITEANM_FRAMES = '@'; //[frames, loops]
var SPRITEANM_LOOPS = /^\/(\d+)/;
function makeSpriteAnimation(imageName, query){
	var i, res = [], qArr, q, spl, frames = [], sprites = [], spa, loops = {}, mat
		, baseFrame = 1;
	
	query = query.replace(/^\[\[\]]+|\[\[\]]+$/g,'');
	qArr = query.split(SPRITEANM_DELIMITER);
	for(i = 0; i < qArr.length; i++){
		q = qArr[i];
		mat = q.match(SPRITEANM_LOOPS);
		if(mat != null){
			loops[sprites.length - 1] = mat[1];
			continue;
		}
		spl = q.split(SPRITEANM_FRAMES);
		if(spl[0].trim().length == 0){
			baseFrame = spl[1];
			continue;
		}
		if(spl[1] == null){
			spl[1] = baseFrame;
		}
		
		sprites.push(makeSpriteQuery(imageName, spl[0]));
		frames.push(spl[1] | 0);
	}
	spa = new SpriteAnimation();
	spa.init(sprites, frames, loops);
	return spa;
};
function SpriteAnimation(){return;}
SpriteAnimation.prototype = {
	init: function(sprites, frames, playCounts){
		var i, len;
		this.sprites = sprites;
		this.frames = frames;
		this.pattern = 0;
		this.count = 0;
		this.currentCount = 0;
		this.visible = true;
		this.lastPattern = sprites.length - 1;
		len = this.lastPattern;
		if(playCounts == null || Object.keys(playCounts).length == 0){
			this.play = {};
			this.play[len] = 0;
		}else{
			this.play = playCounts;
		}
		this.played = {};
		for(i in this.play){
			this.played[i] = 0;
		}
		this.duration = frames.reduce(function(a, b){
			return (a | 0) + (b | 0);
		});
	},
	
	hide: function(){
		this.visible = false;
	},
	show: function(){
		this.visible = true;
	},
	
	reset: function(){
		this.init(this.sprites, this.frames, this.play);
	},
	
	resetLowerPlayed: function(pat){
		var i;
		for(i in this.played){
			if(pat > i){
				this.played[i] = 0;
			}
		}
	},
	
	isLoop: function(){
		var pattern = this.pattern
			, play = this.play[pattern] != null ? this.play[pattern] : null
		;
		
		if(play == null){
			return false;
		}
		if(play > 0){
			if(this.played[pattern] > play){
				return false;
			}
		}
		return true;
	},
	
	isEnd: function(){
		var mp = this.lastPattern
		;
		return this.play[mp] > 0 && (this.played[mp] >= this.play[mp]);
//		return (this.pattern >= mp) && (this.currentCount >= this.frames[mp]) && (this.played[mp] >= this.play[mp]);
	},
	
	current: function(){
		return this.sprites[this.pattern];
	},
	
	next: function(){
		this.count++;
		this.currentCount++;
		
		if(this.currentCount > this.frames[this.pattern]){
			this.currentCount = 0;
			if(this.isLoop()){
				this.played[this.pattern]++;
				this.pattern = 0;
				this.resetLowerPlayed(this.pattern);
			}else{
				this.pattern++;
			}
		}
		if(this.isEnd()){
			if(this.visible){
				this.sprites[this.lastPattern].show();
			}else{
				this.sprites[this.lastPattern].hide();
			}
			return this.sprites[this.lastPattern];
		}
		if(this.visible){
			this.sprites[this.pattern].show();
		}else{
			this.sprites[this.pattern].hide();
		}
		
		return this.sprites[this.pattern];
	}
	
};

function drawDebugCell(scroll, pointControll, wordprint, color){
	var bg = SCROLL.sprite
		, pos = pointControll.getMovePos()
		, start = pointControll.getStartPos()
		, right = pointControll.getState('right')
		, left = pointControll.getState('left')
		, cto = cellhto, toc = tocellh
		, x, y, w = cto(1)
		, r
		, str
		, backScroll = wordprint.getScroll()
		, bgcolor = COLOR_BLACK
	;
	
	color = color == null ? COLOR_WHITE : color;
	
	
	pos = {x: toc(pos.x), y: toc(pos.y)};
	start = {x: toc(start.x), y: toc(start.y)};
	wordprint.setScroll(scroll);
	if(left){
		r = makeRect([start.x, start.y, pos.x, pos.y].join(' ') + ' :pos' );
		scroll.debugRect(makeRect(r.toString() + ' *8'), color);
		
		str = numFormat(r.x, 2) + ':' + numFormat(r.y, 2) + '$n' 
			+ numFormat(r.w, 2) + ':' + numFormat(r.h, 2);
	
		if(r.w > 2 && r.h > 1){
			x = start.x >= pos.x ? start.x - 1.5 : start.x;
			y = start.y >= pos.y ? start.y - 1 : start.y;
		}else{
			x = start.x >= pos.x ? r.ex - 2.5 : r.x;
			y = start.y >= pos.y ? r.ey : r.y - 2;
		}
		x = x > 37.5 ? 37.5 : x;
		y = y > 28 ? 28 : y;
		x += x < 0 ? -x : 0;
		y += y < 0 ? -y : 0;
			
		if(r.isContain(x, y)){
//			color = COLOR_BLACK;
		}
	}else if(right){
		wordprint.print('IMAGE RESOURCES: ' + Object.keys(imageResource.data).length, cto(0), cto(29), color, bgcolor);
		
	}else{
		str = (pos.x < 10 ? 'x:0' : 'x:') + pos.x + '$n' + (pos.y < 10 ? 'y:0' : 'y:') + pos.y + '';
		scroll.debugRect(makeRect(cto(pos.x), cto(pos.y), w, w), color);
		x = pos.x - (pos.x < 1 ? 0 : 1);
		y = pos.y - (pos.y < 2 ? -1 : 2);
	}
	
	wordprint.print(str, cto(x), cto(y), color, bgcolor);
	//戻す
	wordprint.setScroll(backScroll);
	
}
//TODO パレット画像から色配列を取得する仕組みを作る
//TODO パレットを名前から取得できるようにする
//TODO パレットを輝度変更できるような２次元配列

var COLOR_BLACK = [0, 0, 1, 255];
var COLOR_GRAY = [124, 124, 124, 255];
var COLOR_LGRAY = [188, 188, 188, 255];
var COLOR_WHITE = [252, 252, 252, 255];
var COLOR_HLGREEN = [184, 248, 184, 255];
var COLOR_OCEAN = [0, 64, 88, 255];
var COLOR_RED = [248, 56, 0, 255]; //canvasdraw.jsを上書き

var COLOR_MIDNIGHT = [0, 0, 188, 255];
var COLOR_MEDBLUE = [0, 88, 248, 255];
var COLOR_ROYALBLUE = [104, 136, 252, 255];
var COLOR_CORNFLOWER = [184, 184, 248, 255];

var COLOR_FOREST = [0, 120, 0];
var COLOR_LIMEGREEN = [0, 184, 0, 255];
//var COLOR_GREENYELLOW = [216, 248, 120, 255];
var COLOR_GREENYELLOW = [216, 248, 120, 255];

var COLOR_BLUE = [0, 0, 252, 255];

var COLOR_WHEAT = [252, 224, 168, 255];

var COLOR_ORANGERED = [248, 56, 0, 255];
var COLOR_CORAL = [248, 120, 88, 255];
var COLOR_PEACHPUFF = [240, 208, 176, 255];

var COLOR_CARROT = [228, 92, 16, 255];
var COLOR_SANDYBROWN = [252, 160, 68, 255];
var COLOR_MOCCASIN = [252, 224, 168, 255];

var COLOR_DARKGOLDENROD = [172, 124, 0, 255];
var COLOR_BRIGHTYELLOW = [248, 184, 0, 255];
var COLOR_KHAKI = [248, 216, 120, 255];

var COLOR_VEGETABLE = [0, 168, 0, 255];
var COLOR_CREAMGREEN = [88, 216, 84, 255];
var COLOR_PALEGREEN = [184, 248, 184, 255];

var COLOR_POWDERBLUE = [0, 120, 248, 255];
var COLOR_DAYFLOWER = [60, 188, 252, 255];
var COLOR_LBLUE = [164, 228, 252, 255];
//var COLOR_LBLUE = [164, 228, 252, 255];

var COLOR_SLATEBLUE = [104, 68, 252, 255];
var COLOR_MEDPURPLE = [152, 120, 248, 255];
var COLOR_IRISVIOLET = [216, 184, 248, 255];

var COLOR_VIOMAGENTA = [216, 0, 204, 255];
var COLOR_VIOLET = [248, 120, 248, 255];
var COLOR_LPLUM = [248, 184, 248, 255];
