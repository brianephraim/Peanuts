
var alertAsdf = function(){console.log('asdf')}
var tvShowColl = new Meteor.Collection("tvShows");

var meteorView = function(options){
  var self = this;
  var defaults = {
     templateName: '',
     eventMap: {},
     returnDataObj: function(){return {}},
     manipulation:function($el,self){}
  };
  var settings = $.extend({}, defaults, options); 
  var frag = Meteor.render(function() {
    Template[settings.templateName].events = settings.eventMap
    return Template[settings.templateName](settings.returnDataObj());
  });
  var $el = $('<div/>').append(frag);
  settings.manipulation($el,self);
  this.frag = frag;
  this.$el = $el;

}
var makeReactive = function(fun){
  var frag = Spark.render(
    function(){
      return Spark.isolate(
        fun
      );
    }
  );
  return frag;
}

meteorView.prototype.insertReactiveSubviewIntoListItemViaSession = function(settings){
    var self2 = this;
    Meteor.subscribe(settings.subscriptionName, function(){
      console.log('asdfasdf1111')
       settings.listParent$el[settings.targetParentMethod](
          makeReactive( 
             function(){
                if(typeof Session.get(settings.viewIdPrefix+settings.viewId) !== 'undefined'){ 
                   if(typeof settings.selfSubviewAssignment !== 'undefined'){settings.selfSubviewAssignment.kill()}
                   settings.selfSubviewAssignment = settings.viewGenerator(settings.viewId); 
                   if(settings.findString !== ''){
                      settings.listItem$el.find('.'+Session.get(settings.viewIdPrefix+settings.viewId)).find(settings.findString).append(settings.selfSubviewAssignment.$el)
                   } else {
                      settings.listItem$el.find('.'+Session.get(settings.viewIdPrefix+settings.viewId)).append(settings.selfSubviewAssignment.$el) 
                   } 
                }
             }
          )
       )         
    })
 }
meteorView.prototype.kill = function(){ 
      this.$el.remove();
      delete this;
   }
//tvShowColl.findOne({_id:Session.get('selectedArray'+viewId)})
//tvShowColl.findOne({_id:Session.get('selectedArray1')})

var characterListViewGenerator = function(viewId){ return new meteorView({
    templateName: 'characterList',
    returnDataObj: function(){ 

        var collection = tvShowColl.findOne({_id:Session.get('selectedArray'+viewId)});
        if(typeof collection !== 'undefined'){
          self.itemsSourceData = tvShowColl.findOne({_id:Session.get('selectedArray'+viewId)});
        } else {
          self.itemsSourceData = {characters:[]}
        }
        return self.itemsSourceData
        /*
        return {
          //characters:tvShowColl.findOne({_id:Session.get('selectedArray'+viewId)}).characters
          characters:['asdfasdf','ewgqeg']
        }
        */
        //return tvShowColl.findOne({_id:'fyumW4kMQYRMh64Ho'});
    },
    eventMap: {
      "click": function (e, tmpl, x) {
        console.log('ffffff')
      }
    }
  })
}
function returnStates(self){
  var dataSets = {
    tvShowId: self.tvShowObj._id,
    previousBirthingArray: Session.get('birthingArray'+self.nestedViewItem.viewId+'-'+self.nestedViewItem.viewIdX),
    previousSelectedArray: Session.get('selectedArray'+self.nestedViewItem.viewId+'-'+self.nestedViewItem.viewIdX),
    previousDyingArray: Session.get('dyingArray'+self.nestedViewItem.viewId+'-'+self.nestedViewItem.viewIdX),
  }
  var states = {
    previousBirthingArrayContainsId: _.indexOf(dataSets.previousBirthingArray, dataSets.tvShowId) === -1 ? false : true,
    previousSelectedArrayContainsId: _.indexOf(dataSets.previousSelectedArray, dataSets.tvShowId) === -1 ? false : true,
    previousDyingArrayContainsId: _.indexOf(dataSets.previousDyingArray, dataSets.tvShowId) === -1 ? false : true,

    previousBirthingArrayExists: typeof dataSets.previousBirthingArray === 'undefined' ? false : true,
    previousSelectedArrayExists: typeof dataSets.previousSelectedArray === 'undefined' ? false : true,
    previousDyingArrayExists: typeof dataSets.previousDyingArray === 'undefined' ? false : true,

    setDataArray: function(name,arr){
      Session.set(name+self.nestedViewItem.viewId+'-'+self.nestedViewItem.viewIdX,arr);
    }
  }
  return $.extend(states, dataSets);
}
var tvShowListViewGenerator = function(viewId){ return new meteorView({
    templateName: 'rootView', 
    returnDataObj: function(){  
      return {
        nestedViewArray: [ 
          {
            viewIdX: 'x',
            viewId: viewId,
            dataArray: tvShowColl.find().fetch(),

            includeName: 'tvShowList',
            nestedViewArray: [
              {
                viewIdX: 'a',
                viewId: viewId,
                includeName: 'characterList',
                birthingIdArray: Session.get('birthingArray'+viewId+'-'+'x'),
                dyingIdArray: Session.get('dyingArray'+viewId+'-'+'x'),
                selectedIdArray: Session.get('selectedArray'+viewId+'-'+'x'),
                nestedViewArray: []
              },
            ],
          },
          {
            viewIdX: 'y',
            viewId: viewId,
            dataArray: tvShowColl.find().fetch(),

            includeName: 'tvShowList',
            nestedViewArray: [
              {
                viewIdX: 'b',
                viewId: viewId,
                includeName: 'characterList',
                birthingIdArray: Session.get('birthingArray'+viewId+'-'+'y'),
                dyingIdArray: Session.get('dyingArray'+viewId+'-'+'y'),
                selectedIdArray: Session.get('selectedArray'+viewId+'-'+'y'),
                nestedViewArray: []
              },
            ],
          }
        ]
      }
    },
    eventMap: {
      "click .tvShowNameYear": function (e, tmpl, x) {
        console.log(this)
        var self = this;
        var s = returnStates(self);

        //Add to selected when appropriate
        if(s.previousSelectedArrayExists && !s.previousSelectedArrayContainsId){
          s.previousSelectedArray.push(s.tvShowId)
          s.setDataArray('selectedArray',s.previousSelectedArray)
        }
        if(!s.previousSelectedArrayExists){
          s.previousSelectedArray = [s.tvShowId]
          s.setDataArray('selectedArray',s.previousSelectedArray)
        }

        //Add to birthing when appropriate
        if(s.previousBirthingArrayExists && !s.previousBirthingArrayContainsId){
          s.previousBirthingArray.push(s.tvShowId)
          s.setDataArray('birthingArray',s.previousBirthingArray)
        }
        if(!s.previousBirthingArrayExists){
          s.setDataArray('birthingArray',[s.tvShowId])
        }

        //Make an existing characterList disappear
        if(
          (s.previousSelectedArrayExists && s.previousSelectedArrayContainsId) && 
          (!s.previousBirthingArrayExists || !s.previousBirthingArrayContainsId)
        ){
          s.previousSelectedArray.splice(_.indexOf(s.previousSelectedArray, s.tvShowId),1)
          if(s.previousDyingArrayExists && !s.previousDyingArrayContainsId){
            s.previousDyingArray.push(s.tvShowId)
          } else {
            s.previousDyingArray = [s.tvShowId];
          }
          s.setDataArray('dyingArray',s.previousDyingArray)
          s.setDataArray('selectedArray',s.previousSelectedArray)
        }
      },
      "click .changeNameButton": function (e, tmpl, x) {
        var newName = ($(e.target).closest('li').find('.changeNameInput').val())
        tvShowColl.update({'_id':this.tvShowObj._id}, {$set:{name:newName}});
      },
      "click .addCharacterButton": function (e, tmpl) {
        var newCharacter = $(e.target).closest('li').find('.addCharacterInput').val();
        //var currentTvShowId = Session.get('selectedArray'+viewId+'-'+this.nestedViewItem.viewIdX);
        var currentTvShowId = this.tvShowObj._id
        console.log(currentTvShowId)
        console.log(this.tvShowObj._id)
        var currentCharactersArray = tvShowColl.findOne({_id:currentTvShowId}).characters;
        currentCharactersArray.push(newCharacter);
        tvShowColl.update({'_id':currentTvShowId}, {$set:{characters:currentCharactersArray}});
      }
    },

    manipulation:function($el,self){
            //Insert subviews into individual list items within this tvShowListView container, based on current selection
            /*
            self.insertReactiveSubviewIntoListItemViaSession(
               {
                  listItem$el:$el,
                  viewId:viewId,
                  viewIdPrefix:'selectedArray',
                  subscriptionName:'tvShows',
                  selfSubviewAssignment:self.charactersView,
                  viewGenerator:characterListViewGenerator,
                  listParent$el:$el,
                  targetParentMethod:'append',
                  findString:'.insertTarget'
               }
            )
            */ 
         }
  })
}

if (Meteor.isClient) {
  var $window = $(window);
  var windowWidth = $window.width();
  var resizeTimer;
  function resizeAction(){
    windowWidth = $window.width();
  }
  $window.resize(function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      resizeAction();
    }, 300);
  });

  function appearAnimation(){
    var anim = CSSAnimations.create();
    for(var i = 0; i<=100; i++){
      var interpolatedValues = Tweenable.interpolate(
        {
          '-webkit-transform': 'translate3d('+windowWidth+'px,0,0)'
        },
        {
          '-webkit-transform': 'translate3d(0px,0,0)'
        },
        i*0.01,
        'easeOutBounce'
      );
      anim.setKeyframe(i+'%', interpolatedValues);
    }

    //anim.setKeyframe('0%', {'background-color': '#2299aa','opacity': '1'});
    //anim.setKeyframe('100%', {'background-color': '#000000','opacity': '0'});
    return '-webkit-animation: '+anim.name+' 1s ease;';
  }

  function disappearAnimation(){
    var anim = CSSAnimations.create();
    for(var i = 0; i<=100; i++){
      var interpolatedValues = Tweenable.interpolate(
        {
          '-webkit-transform': 'translate3d(0px,0,0)'
        },
        {
          '-webkit-transform': 'translate3d('+windowWidth+'px,0,0)'
        },
        i*0.01,
        'easeOutBounce'
      );
      anim.setKeyframe(i+'%', interpolatedValues);
    }

    //anim.setKeyframe('0%', {'background-color': '#2299aa','opacity': '1'});
    //anim.setKeyframe('100%', {'background-color': '#000000','opacity': '0'});
    return '-webkit-animation: '+anim.name+' 1s ease;';
  }


  for(i in Template){
    if (Template.hasOwnProperty(i)) {
      Template[i].rendered = function(){
        if(typeof this.data !== 'undefined' && typeof this.data['marley'] !== 'undefined'){
          console.log(this.data)
          console.log(this.find('*'))
          //$(this.find('*')).addClass('slideIn')
        }
      }
    }
  }
  


  Template.characterList.events = {
    "click": function (e, tmpl, x) {
      console.log(this)
    },
    "webkitTransitionEnd": function (e, tmpl, x) {
      console.log('ddfdsfadfasdfasdfasd')
      console.log(this)
    },
    "webkitAnimationEnd": function (e, tmpl, x) {
      var self = this;
      
      
      var s = returnStates(self);
      
      if(s.previousBirthingArrayExists && s.previousBirthingArrayContainsId){
        s.previousBirthingArray.splice(_.indexOf(s.previousBirthingArray, s.tvShowId),1)
        s.setDataArray('birthingArray',s.previousBirthingArray)
      }
      if(s.previousDyingArrayExists && s.previousDyingArrayContainsId){
        s.previousDyingArray.splice(_.indexOf(s.previousDyingArray, s.tvShowId),1)
        s.setDataArray('dyingArray',s.previousDyingArray)
      }




    }
  }

  Session.set('name','Brian')
  Session.set('question','what?')

  

  var tvShowListView1 = tvShowListViewGenerator('1')
  //var tvShowListView2 = tvShowListViewGenerator('2')
  /*
  var tvShowListView2 = new meteorView({
    templateName: 'tvShowList',
    returnDataObj: function(){return {dataArray:tvShowColl.find().fetch()}},
    eventMap: {}
  })
  */
  var curentSelectionFrag = makeReactive( 
     function(){
        var doc = tvShowColl.findOne({_id:Session.get('selectedArray1')});
        var string = typeof doc !== 'undefined' ? doc.name : 'none selected';
        return 'Current selection: '+string;
     } 
  );
  var currentSelectionWrapper = $('<p class="currentSelection"></p>');
  currentSelectionWrapper.append(curentSelectionFrag)



  Meteor.startup(function () {
    return (function(){
      Meteor.subscribe('tvShows', function(){
        //var characterListView1 = characterListViewGenerator('1');
        //$('body').append(characterListView1.$el)
      });
      
      $('body').append(currentSelectionWrapper)
      $('body').append(
        tvShowListView1.$el
      );
      $('body').append(
        //tvShowListView2.$el
      );
    })();
  });
}



if(Meteor.isServer) {
    Meteor.startup(function () {
     Meteor.publish("tvShows", function() {
       return tvShowColl.find(
          {},
          {fields:{Category:1}});
     });
   });
  if (tvShowColl.find().count() === 0) {
       var data = [
          {
             name:'Game of Thrones',
             year:'2011',
             characters: ['Jon Snow','Tyrion Lannister','Daenerys Targaryen']
          },
          {
             name:'The Walking Dead',
             year:'2010',
             characters: ['Rick Grimes','Daryl Dixon','Glenn Rhee']
          }
       ]
       
       for (var i = 0; i < data.length; i++){
          tvShowColl.insert(data[i]);
       }
    }

}

