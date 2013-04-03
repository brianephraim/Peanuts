
var tvShowColl = new Meteor.Collection("tvShows");

if(Meteor.isServer) {
  if (tvShowColl.find().count() === 0) {
     var data = [
        {
           name:'Game of Thrones',
           year:'2011',
           characters: ['Jon Snow','Tyrion Lannister','Daenerys Targaryen','Detective Munch'],
           genres: ['Adventure','Drama','Fantasy']
        },
        {
           name:'The Walking Dead',
           year:'2010',
           characters: ['Rick Grimes','Detective Munch','Daryl Dixon','Glenn Rhee'],
           genres: ['Drama','Horror','Thriller']
        }
     ]
     for (var i = 0; i < data.length; i++){
        tvShowColl.insert(data[i]);
     }
  }
}

if (Meteor.isClient) {
  Meteor.subscribe('tvShows', function () {});

  
  Template.rootView.events = {
    "click .addCharacterList": function (e, tmpl, x) {
      var self = this;
      Peanuts.prependView(this.nestedViewArray,
        {
          includeName:'characterList'
        }
      )

    }
  }
  Template.tvShowListButton.events = {
    "click": function (e, tmpl, x) {
      var self = this;
      Peanuts.showHideView(self)
    }
  }
  Template.tvShowListPanel.events = {
    "webkitAnimationEnd": function (e, tmpl, x) {
      var self = this;
      Peanuts.animationEndHideShowCleanup2(self)
    }
  }
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
  Template.tvShowListItem.events = {
    "click .changeNameButton": function (e, tmpl, x) {
      var newName = $(e.target).closest('.form').find('.changeNameInput').val();
      tvShowColl.update({'_id':this.itemDataObj._id}, {$set:{name:newName}});
    }
  }

  tvShowColl.find( { 'genres':  'Adventure'   } ).fetch()



  var characterMega = function(){return{/*start*/
    includeName:'characterList',
    dataArray:'childItemDataObj',
    returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
      [
        //tvMega()
      ]
    )
  }}

  var tvMega = function(){return{/*start*/
    includeName:'tvShowList',
    dataArray:tvShowColl.find().fetch(),
    returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
      [
        characterMega(),
        {
          includeName:'genreList',
          //dataArray:'childItemDataObj',
          returnNestedViewArray:Peanuts.createReturnNestedViewArray(self, 
            [
              {
                includeName:'tvShowList',
                dataArray:tvShowColl.find().fetch(),
                returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
                  []
                )
              }
            ]
          )
        },
      ]
    )
  }}/*end*/
  if(typeof Session.get('config') === 'undefined'){
    Session.set('config',[
      {
        includeName:'characterList'
      },
      {
        includeName:'characterList'
      }
    ]);
  }
  Peanuts.viewCatalog={};
  Meteor.startup(function () {
    return (function(){
      Peanuts.theOuterView = new Peanuts.meteorView({
        templateName: 'rootView', 
        returnDataObj: function(){ 
          return new (function(){
            var self = this;
            this.viewId = 'base';
            this.viewIdX = '';
            this.nestedViewArray= (function(){
              var k = 0;
              /**/
              function createAViewGenerator(includeName,returnDataArray){
                return Peanuts.createAView({
                  parent:self,
                  k:k++,
                  includeName:includeName,
                  dataArray:Peanuts.returnDistinctTagsArray(tvShowColl.find(),'characters'),
                  returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
                    [
                      tvMega()
                    ]
                  )
                })
              }


              var returnArray = [];
              var config = Session.get('config')
              for(var i=0,l=config.length;i<l;i++){
                returnArray.push(
                  createAViewGenerator(config[i].includeName,config.dataArray)
                )
              }

              return returnArray
              
              /*
              return [
                Peanuts.createAView({
                  parent:self,
                  k:k++,
                  includeName:'characterList',
                  dataArray:Peanuts.returnDistinctTagsArray(tvShowColl.find(),'characters'),
                  returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
                    [
                      tvMega()
                    ]
                  )
                }),
                
                Peanuts.createAView({
                  parent:self,
                  k:k++,
                  includeName:'genreListPanel',
                  dataArray:Peanuts.returnDistinctTagsArray(tvShowColl.find(),'genres'),
                  returnNestedViewArray:function(self){ return (function(){
                    var k = 0;
                    return [
                      Peanuts.createAView({
                        parent:self,
                        k:k++,
                        includeName:'tvShowList',
                        dataArray:tvShowColl.find().fetch()
                      })
                    ]
                  })()}
                }),
                Peanuts.createAView({
                  parent:self,
                  k:k++,
                  includeName:'tvShowListPanel',
                  dataArray:tvShowColl.find( { 'genres':  'Adventure'   } ).fetch()
                }),
                
                Peanuts.createAView({
                  parent:self,
                  k:k++,
                  includeName:'tvShowListPanel',
                  dataArray:tvShowColl.find().fetch(),
                  returnNestedViewArray:function(self){ return (function(){
                    var k = 0;
                    return [
                      Peanuts.createAView({
                        parent:self,
                        k:k++,
                        includeName:'characterList',
                        returnNestedViewArray:function(self){ return (function(){
                          var k = 0;
                          return [
                            Peanuts.createAView({
                              parent:self,
                              k:k++,
                              includeName:'tvShowList',
                              dataArray:tvShowColl.find().fetch()
                            })
                          ]
                        })()}
                      }),
                      Peanuts.createAView({
                        parent:self,
                        k:k++,
                        includeName:'genreList',
                        returnNestedViewArray:function(self){ return (function(){
                          var k = 0;
                          return [
                            Peanuts.createAView({
                              parent:self,
                              k:k++,
                              includeName:'tvShowList',
                              dataArray:tvShowColl.find().fetch()
                            })
                          ]
                        })()}
                      })
                    ]
                  })()}
                }),//

              ]
              */
            })()
          })()
        }
      }).$el
      $('body').append(Peanuts.theOuterView);//
    })();
  });
}





