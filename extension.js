
const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Json = imports.gi.Json;
const Soup = imports.gi.Soup;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Shell = imports.gi.Shell;
const Signals = imports.signals;

const _httpSession = new Soup.SessionAsync();
Soup.Session.prototype.add_feature.call(_httpSession, new Soup.ProxyResolverDefault());

var text, button, matchList;
const REFRESH_INTERVAL = 12;
var matchNum = 0;
var counter = 0;

function DualActionButton(menuAlignment) {
    this._init(menuAlignment);
}
 
DualActionButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,
 
    _init: function(menuAlignment) {
        PanelMenu.ButtonBox.prototype._init.call(this, { reactive: true,
                                               can_focus: true,
                                               track_hover: true });
 
        this.actor.connect('notify::hover', Lang.bind(this, this._onHover));
        this.actor.connect('button-press-event', Lang.bind(this, this._onClick));
 
        this.menuL = new PopupMenu.PopupMenu(this.actor, menuAlignment, St.Side.TOP);
        this.menuL.actor.add_style_class_name('panel-menu');
        //this.menuL.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
        //this.menuL.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
        Main.uiGroup.add_actor(this.menuL.actor);
        this.menuL.actor.hide();
 
        this.menuR = new PopupMenu.PopupMenu(this.actor, menuAlignment, St.Side.TOP);
        this.menuR.actor.add_style_class_name('panel-menu');
        //this.menuR.connect('open-state-changed', Lang.bind(this, this._onOpenStateChanged));
        //this.menuR.actor.connect('key-press-event', Lang.bind(this, this._onMenuKeyPress));
        Main.uiGroup.add_actor(this.menuR.actor);
        this.menuR.actor.hide();
    },
 	_onHover: function(actor){
 		/*Mainloop.timeout_add_seconds(2, Lang.bind(this, function() {
							/*if (this.menuL.isOpen)
          						this.menuL.close();
          					
						}));*/
		for(let i=0; i<1000; i++){
				if(i==999){
					if (actor.hover)
			        	this.menuR.open();
			        else
			        	this.menuR.close();
			    }
		}
 		//showTweener("Hover");
 		//
        //let a = actor;

        
 	},
 	_onClick: function(actor, event){
 		//showTweener("Click");
 		if (this.menuL.isOpen) {
            this.menuL.close();
        } else {
            if (this.menuR.isOpen)
                this.menuR.close();
            this.menuL.open();
        }
 		/*let button = event.get_button();
        if (button == 1) {
            
        } else if (button == 3) {
            if (this.menuR.isOpen) {
                this.menuR.close();
            } else {
                if (this.menuL.isOpen)
                    this.menuL.close();
                this.menuR.open();
            }
        }*/

 	},
    _onOpenStateChanged: function(menu, open) {
        if (open)
            this.actor.add_style_pseudo_class('active');
        else
            this.actor.remove_style_pseudo_class('active');
    },
 
    destroy: function() {
        this.actor._delegate = null;
        this.menuL.destroy();
        this.menuR.destroy();
        this.actor.destroy();
        this.emit('destroy');
    },
 
};
Signals.addSignalMethods(DualActionButton.prototype);
 

function DemoDualActionButton() {
   this._init();
}

DemoDualActionButton.prototype = {
    __proto__: DualActionButton.prototype,
 
    _init: function() {
        DualActionButton.prototype._init.call(this, 0.0);
        this.buttonText = new St.Label({text:_("Initializing")});
        this.buttonText.set_style("text-align:center;");
        this.actor.add_actor(this.buttonText);
        var xyz = new Array();
     
        this._refreshScore(REFRESH_INTERVAL);
        //item = new PopupMenu.PopupMenuItem(_("IND : 444/10 (111.3)  \t\t PAK : 444/10 (111.3) \nIND : 444/10 (111.3) \t\t  PAK : 444/10 (111.3)  \n\nV.Sehwag : \t\t 100 (111)\nV.Sehwag : \t\t 100 (111)\nV.Sehwag : \t\t 100-2-111-1\nV.Sehwag : \t\t 100-2-111-1"));
        //this.menuR.addMenuItem(item);

        /*item = new PopupMenu.PopupMenuItem(_("Right Menu Item 2"));
        this.menuR.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Right Menu Item 3"));
        this.menuR.addMenuItem(item);
        item = new PopupMenu.PopupMenuItem(_("Right Menu Item 4"));
        this.menuR.addMenuItem(item);*/
    },
    _refreshScore: function(interval){
      var here = this;
      this._upcomingMatches(function(){
        Mainloop.timeout_add_seconds(interval, Lang.bind(this, function() {
          here._refreshScore(REFRESH_INTERVAL);
        }));
      });
    },
    _upcomingMatches: function(fun){
      try{
        var dropDown = this.menuL;
        var toolTip = this.menuR;
        var mainScore = this.buttonText;
        var t = this;      
        //http://query.yahooapis.com/v1/public/yql?q=select%20teams.i,%20teams.fn,teams.sn,%20past_ings.s.a%20from%20cricket.scorecard.live.summary&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0
        load_json_async("http://query.yahooapis.com/v1/public/yql?q=select%20mid,%20%20teams.i,%20teams.fn,teams.sn,%20past_ings.s.a%20from%20cricket.scorecard.live.summary%20|%20sort(field=%22mid%22)&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0", function(json0){
          if(json0==null){
            fun();
          }else{
            var results = json0.get_object_member('query').get_object_member('results');
            var teamsMap=new Array(), scoreMap=new Array(), upcomingMap=null;
            try{
              if(results==null){
                //attachMapsToViews(teamsMap, scoreMap, dropDown, toolTip, mainScore);
              }else{

                var scorecard = results.get_object_member('Scorecard');
                if(scorecard!=null){
                  teamsMap.push(getTeamMap(scorecard));
                  scoreMap.push(getScoreMap(scorecard));
                }else{
                  for(var i=0; i<results.get_array_member('Scorecard').get_length(); i++){
                    let scorecard = results.get_array_member('Scorecard').get_elements()[i].get_object();    
                    teamsMap.push(getTeamMap(scorecard));
                    scoreMap.push(getScoreMap(scorecard));
                  }
                }
              }
              load_json_async("http://query.yahooapis.com/v1/public/yql?q=select%20Team.Team%2C%20StartDate%20from%20cricket.upcoming_matches&format=json&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0", function(json){
                if(json==null){
                  fun();
                }else{
                  if(json.get_object_member('query').get_object_member('results')!=null){
                    var match = json.get_object_member('query').get_object_member('results').get_array_member("Match");
                    upcomingMap = getUpcomingMatchesMap(match);
                  }
  	              if(matchNum>scoreMap.length)
  		              matchNum = 0;
                  attachMapsToViews(teamsMap, scoreMap, upcomingMap, dropDown, toolTip, mainScore, matchNum, t);     
                  fun();
                }     
              });
            }catch(e){
              global.log('A ' + e.name + ' has occured: ' + e.message);
              fun();
            }
          }
      });
    }catch(e){
        global.log('A ' + e.name + ' has occured: ' + e.message);
        fun();
      }
    },
    enable: function() {
        Main.panel._centerBox.add(this.actor, { y_fill: true });
        Main.panel._menus.addMenu(this.menuL);
        Main.panel._menus.addMenu(this.menuR);
    },
 
    disable: function() {
        Main.panel._centerBox.remove_actor(this.actor);
        Main.panel._menus.removeMenu(this.menuL);
        Main.panel._menus.removeMenu(this.menuR);
    }
};
 
 
function init() {
    return new DemoDualActionButton();
}

/*
    Parsing teams information:
      1.) Teaam's ID
      2.) Fullname
      3.) Smallname

    A map is created that maps Team ID with fullname & smallname.
*/
function getTeamMap(scorecard){
  let teams_array = scorecard.get_array_member('teams').get_elements();
  var teamsMap = new Object();
  teamsMap[teams_array[0].get_object().get_string_member("i")] = {
    'small': teams_array[0].get_object().get_string_member("sn"),
    'full': teams_array[0].get_object().get_string_member("fn")
  };
  teamsMap[teams_array[1].get_object().get_string_member("i")] = {
    'small': teams_array[1].get_object().get_string_member("sn"),
    'full': teams_array[1].get_object().get_string_member("fn")
  };
  return teamsMap;
}

function getHeadingPopupItem(heading){
  let currentMatchHeading = new PopupMenu.PopupMenuItem(_(heading), {reactive: false});
  currentMatchHeading.actor.add_style_class_name("match-heading"); 
  return currentMatchHeading; 
}

function getPopupItem(text){
  let currentMatchItem = new PopupMenu.PopupMenuItem(_(text), {reactive: false});
  currentMatchItem.actor.add_style_class_name("match-item");  
  return currentMatchItem;
}

function getClickablePopupItem(text, t, num){
  let currentMatchItem = new PopupMenu.PopupMenuItem(_(text));
  currentMatchItem.actor.add_style_class_name("match-item");  
  currentMatchItem.actor.connect('button-press-event', function(){
    matchNum = num;
    t._upcomingMatches(function(){});
  });
  return currentMatchItem;
}

function addseperator(menu){
  let Separator = new PopupMenu.PopupSeparatorMenuItem();
  menu.addMenuItem(Separator);
}

function attachMapsToViews(teamsMap, scoreMap, upcomingMap, dropDown, toolTip, mainScore, matchNum, t){

  dropDown.removeAll();
  toolTip.removeAll();
  dropDown.addMenuItem(getHeadingPopupItem("Current Matches"));
  addseperator(dropDown);
  if(teamsMap.length==0 || scoreMap.length==0){
    dropDown.addMenuItem(getPopupItem("No Live Matches"));
    mainScore.set_text(_("No Live Match"));
    toolTip.addMenuItem(getPopupItem("No Live Matches"));
  }else{
    var mainScoreText = teamsMap[matchNum][scoreMap[matchNum][0]["teamId"]]["small"]+" : "+scoreMap[matchNum][0]["runs"]+"/"+scoreMap[matchNum][0]["wickets"]+" ("+scoreMap[matchNum][0]["overs"]+")";
     mainScore.set_text(_(mainScoreText));


    

    for(var i=0; i<teamsMap.length; i++){
      var currentMatchText = teamsMap[i][scoreMap[i][0]["teamId"]]["small"]+" : "+scoreMap[i][0]["runs"]+"/"+scoreMap[i][0]["wickets"]+" ("+scoreMap[i][0]["overs"]+")";
      if(scoreMap[i].length>1){
        currentMatchText+="   "+teamsMap[i][scoreMap[i][1]["teamId"]]["small"]+" : "+scoreMap[i][1]["runs"]+"/"+scoreMap[i][1]["wickets"]+" ("+scoreMap[i][1]["overs"]+")";
      }

      //currentMatchText+="  -  "+teamsMap[i][scoreMap[i][0]["teamId"]]["full"]+"  VS  "+teamsMap[i][scoreMap[i][1]["teamId"]]["full"];
      dropDown.addMenuItem(getClickablePopupItem(currentMatchText,t,i));
    }

    /*var toolTipText = "";
    for(team in teamsMap[matchNum]){
        toolTipText+=teamsMap[matchNum][team]["small"]+"\t";
    }*/
    var toolTipText = "\n";
    for(var i=0; i<scoreMap[matchNum].length; i++){
        toolTipText+=teamsMap[matchNum][scoreMap[matchNum][i]["teamId"]]["small"]+" : "+scoreMap[matchNum][i]["runs"]+"/"+scoreMap[matchNum][i]["wickets"]+" ("+scoreMap[matchNum][i]["overs"]+")";
        if(i%2==0){
          toolTipText+="\t\t";
        }else{
          toolTipText+="\n";
        } 
    }
    toolTipText+=" ";
    toolTip.addMenuItem(getHeadingPopupItem(toolTipText));
  }

  dropDown.addMenuItem(getHeadingPopupItem(" ")); 

  dropDown.addMenuItem(getHeadingPopupItem("Upcoming Matches"));
  addseperator(dropDown);
  if(upcomingMap==null){
    dropDown.addMenuItem(getPopupItem("No Upcoming Matches"));
  }else{
    for(var i=0; i<upcomingMap.length; i++){
      dropDown.addMenuItem(getPopupItem(upcomingMap[i]["date"]+" - "+upcomingMap[i]["t1"]+"  VS  "+upcomingMap[i]["t2"]));
    }
  }
}

function getUpcomingMatchesMap(match){

  var matches = match.get_elements();
  var totalMatches = match.get_length();
  var upcomingMap = new Array();

  for(let i=0; i<totalMatches; i++){

    let imatch = matches[i].get_object();
    let unformattedStartDate = imatch.get_string_member('StartDate');
    let formattedStartDate = unformattedStartDate.substring(0, unformattedStartDate.indexOf('T'));
     
    let teams = imatch.get_array_member('Team').get_elements();
    
    upcomingMap[i]={
      'date' : formattedStartDate,
      't1'   : teams[0].get_object().get_string_member('Team'),
      't2'   : teams[1].get_object().get_string_member('Team'),
    };
  }
  return upcomingMap;
}
/*
    Parsing all inning's score:
      1.) Inning number(small is latest)
      2.) Team ID
      3.) Runs
      4.) wickets
      5.) overs

    A map is created that maps Inning Number with score informations.

*/
function getScoreMap(scorecard){

  let innings = scorecard.get_object_member('past_ings');
  var scoreMap = new Array();
  /* 
    Counting number of innings. In case of single inning, json emits an object, an array of objects otherwise.
  */
  let totalInnings = 1;
  if(innings !=null){
      //This means inning object is returned not an array. Hence only Single Inning.

  }else{
      //Multiple Innings
      innings = scorecard.get_array_member('past_ings');
      totalInnings = innings.get_length();
      innings = innings.get_elements();
  }
  /*
    Innings Object to Map
  */
  if(totalInnings==1){
      var r = innings.get_object_member('s').get_object_member('a');
      scoreMap[0]={

              'teamId':   r.get_string_member("i"),
              'runs':     r.get_string_member("r"),
              'wickets':  r.get_string_member("w"),
              'overs':    r.get_string_member("o")
          };
      
  }else{

      for(var i=0; i<totalInnings; i++){

          var r = innings[i].get_object().get_object_member('s').get_object_member('a');
          scoreMap[i] = {

              'teamId':   r.get_string_member("i"),
              'runs':     r.get_string_member("r"),
              'wickets':  r.get_string_member("w"),
              'overs':    r.get_string_member("o")
          };
      }
  }
  return scoreMap;
}



function showTweener(textToShow){

	if (!text) {
		text = new St.Label({ style_class: 'helloworld-label', text: textToShow });
		Main.uiGroup.add_actor(text);
	}
	text.opacity = 255;
   	let monitor = Main.layoutManager.primaryMonitor;
   	text.set_position(Math.floor(monitor.width / 2 - text.width / 2),
		              Math.floor(monitor.height / 2 - text.height / 2));
	Tweener.addTween(text,
             { opacity: 0,
               time: 10,
               transition: 'easeOutQuad', 
               onComplete: _hideHello 
           });

}

function load_json_async(url, fun) {
        counter++;
        //showTweener("Counter: "+counter);
        global.log("Counter: "+counter);
        let here = this;

        let message = Soup.Message.new('GET', url);
        _httpSession.queue_message(message, function(session, message) {
            let jp = new Json.Parser();
            global.log(message.response_body.data==null);
            if(message.response_body.data==null){
              fun.call(here, null);
            }else{
              jp.load_from_data(message.response_body.data, -1);
              fun.call(here, jp.get_root().get_object());
            }
        });
}
