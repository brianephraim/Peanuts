
var tvShowColl = new Meteor.Collection("tvShows");
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





