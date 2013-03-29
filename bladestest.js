
var tvShowColl = new Meteor.Collection("tvShows");
var DramaColl = new Meteor.Collection("dramas");
if(Meteor.isServer) {
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

if (Meteor.isClient) {
  Meteor.subscribe('tvShows', function () {
    //
  });

  // Always be subscribed to the todos for the selected list.
  Meteor.autosubscribe(function () {
    //var list_id = Session.get('list_id');
    //if (list_id)
      //Meteor.subscribe('todos', list_id);
  });

  Template.characterListPanel.events = {
    "webkitAnimationEnd": function (e, tmpl, x) {
      var self = this;
      Peanuts.animationEndHideShowCleanup(self)
    },
    "click .addCharacterButton": function (e, tmpl) {
      var newCharacter = $(e.target).closest('li').find('.addCharacterInput').val();
      var currentTvShowId = this.itemDataObj._id
      var currentCharactersArray = tvShowColl.findOne({_id:currentTvShowId}).characters;
      currentCharactersArray.push(newCharacter);
      tvShowColl.update({'_id':currentTvShowId}, {$set:{characters:currentCharactersArray}});
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
  Template.tvShowItem.events = {
    "click .changeNameButton": function (e, tmpl, x) {
      var newName = $(e.target).closest('.form').find('.changeNameInput').val();
      tvShowColl.update({'_id':this.itemDataObj._id}, {$set:{name:newName}});
    }
  }//asdfasdfasdfa

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
                  Peanuts.createAView(self,k++,'tvShowList',tvShowColl.find().fetch(),
                    function(self){ return (function(){
                      var k = 0;
                      return [
                        Peanuts.createAView(self,k++,'characterList',tvShowColl.find().fetch(),
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        ),
                        Peanuts.createAView(self,k++,'genreList',tvShowColl.find().fetch(),
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        )
                      ]
                    })()}
                  ),
                  Peanuts.createAView(self,k++,'tvShowList',tvShowColl.find().fetch(),
                    function(self){ return (function(){
                      var k = 0;
                      return [
                        Peanuts.createAView(self,k++,'characterList',tvShowColl.find().fetch(),
                          function(self){ return (function(){
                            var k = 0;
                            return []
                          })()}
                        ),
                        Peanuts.createAView(self,k++,'genreList',tvShowColl.find().fetch(),
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
          }
        }).$el
      );
    })();
  });
}





