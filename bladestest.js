
var tvShowColl = new Meteor.Collection("tvShows");

if (Meteor.isClient) {
  var Peanuts = new (function(){
    this.meteorView = function(options){
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
  
    this.returnStates = function(self){
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
  
    this.showHideView = function(self){
      var s = Peanuts.returnStates(self);
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
        s.setDataArray('selectedArray',s.previousSelectedArray)
        s.setDataArray('dyingArray',s.previousDyingArray)
      }
    }
  
    this.createAView = function(parent,k,includeName,nestedViewArray){
      return new (function(){
        var self = this;
        this.parent = parent;
        this.viewId = self.parent.viewId + '-' + self.parent.viewIdX;
        this.includeName = includeName;
        this.viewIdX = this.includeName + (k);
        this.dataArray = tvShowColl.find().fetch();
        this.birthingIdArray = Session.get('birthingArray'+this.viewId+'-'+this.viewIdX);
        this.dyingIdArray = Session.get('dyingArray'+this.viewId+'-'+this.viewIdX);
        this.selectedIdArray = Session.get('selectedArray'+this.viewId+'-'+this.viewIdX);
        this.nestedViewArray = nestedViewArray(self)
      })();
    }
    this.animationEndHideShowCleanup = function(self,viewNameWithIndex){
      var s = Peanuts.returnStates(self);
      if(s.previousBirthingArrayExists && s.previousBirthingArrayContainsId){
        s.previousBirthingArray.splice(_.indexOf(s.previousBirthingArray, s.tvShowId),1)
        s.setDataArray('birthingArray',s.previousBirthingArray)
      }
      if(s.previousDyingArrayExists && s.previousDyingArrayContainsId){
        s.previousDyingArray.splice(_.indexOf(s.previousDyingArray, s.tvShowId),1)
        s.setDataArray('dyingArray',s.previousDyingArray)
      }
    }
  


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
    this.animations = {
      appear:function(){
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
        return '-webkit-animation: '+anim.name+' 1s ease;';
      },
      disappear:function(){
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
        return '-webkit-animation: '+anim.name+' 1s ease;';
      }
    }
    
  })()

    Template.characterListPanel.events = {
      "webkitAnimationEnd": function (e, tmpl, x) {
        var self = this;
        Peanuts.animationEndHideShowCleanup(self)
      }
    }
    Template.genreListPanel.events = {
      "webkitAnimationEnd": function (e, tmpl, x) {
        var self = this;
        Peanuts.animationEndHideShowCleanup(self)
      }
    }
    Template.genreListButton.events = {
      "click": function (e, tmpl, x) {
        var self = this;
        Peanuts.showHideView(self)
      }
    }
    Template.characterListButton.events = {
      "click": function (e, tmpl, x) {
        var self = this;
        Peanuts.showHideView(self)
      }
    }
  //})()

  Meteor.startup(function () {
    return (function(){
      $('body').append(
        new Peanuts.meteorView({
          templateName: 'rootView', 
          returnDataObj: function(){ 
            return new (function(){
              var self = this;
              this.viewId = 'base';
              this.viewIdX = '';
              this.nestedViewArray= (function(){
                var k = 0;
                return [
                  Peanuts.createAView(self,k++,'tvShowList',
                    function(self){ return (function(){
                      var k = 0;
                      return [
                        Peanuts.createAView(self,k++,'characterList',
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        ),
                        Peanuts.createAView(self,k++,'genreList',
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        )
                      ]
                    })()}
                  ),
                  Peanuts.createAView(self,k++,'tvShowList',
                    function(self){ return (function(){
                      var k = 0;
                      return [
                        Peanuts.createAView(self,k++,'characterList',
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        ),
                        Peanuts.createAView(self,k++,'genreList',
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        )
                      ]
                    })()}
                  )
                ]
              })()
            })()
          },
          eventMap: {
            "click .changeNameButton": function (e, tmpl, x) {
              var newName = ($(e.target).closest('li').find('.changeNameInput').val())
              tvShowColl.update({'_id':this.tvShowObj._id}, {$set:{name:newName}});
            },
            "click .addCharacterButton": function (e, tmpl) {
              var newCharacter = $(e.target).closest('li').find('.addCharacterInput').val();
              //var currentTvShowId = Session.get('selectedArray'+viewId+'-'+this.nestedViewItem.viewIdX);
              var currentTvShowId = this.tvShowObj._id
              var currentCharactersArray = tvShowColl.findOne({_id:currentTvShowId}).characters;
              currentCharactersArray.push(newCharacter);
              tvShowColl.update({'_id':currentTvShowId}, {$set:{characters:currentCharactersArray}});
            }
          }
        }).$el
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
             characters: ['Jon Snow','Tyrion Lannister','Daenerys Targaryen'],
             genres: ['Adventure','Drama','Fantasy']
          },
          {
             name:'The Walking Dead',
             year:'2010',
             characters: ['Rick Grimes','Daryl Dixon','Glenn Rhee'],
             genres: ['Drama','Horror','Thriller']
          }
       ]
       for (var i = 0; i < data.length; i++){
          tvShowColl.insert(data[i]);
       }
    }

}

