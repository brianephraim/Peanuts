
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


  
  Template.rootView.events({
    "click .addCharacterList": function (e, tmpl, x) {
      var self = this;
      Peanuts.prependView(this.nestedViewArray,
        {
          includeName:'characterList'
        }
      )

    }
  })
  Template.basicListItem.events({
    "click .changeNameButton": function (e, tmpl, x) {
      var newName = $(e.target).closest('.form').find('.changeNameInput').val();
      tvShowColl.update({'_id':this._id}, {$set:{name:newName}});
      e.stopPropagation()
      return false  
    }
  })

  Template.characterListPanel.events({
    "webkitAnimationEnd": function (e, tmpl, x) {
      var self = this;
      Peanuts.animationEndHideShowCleanup(self)
    },
    "click .addCharacterButton": function (e, tmpl) {
      console.log(this)
      console.log(tmpl)
      console.log(this.boomer)
      console.log(this.boomer2)
      /*
      var newCharacter = $(e.target).closest('li').find('.addCharacterInput').val();
      var currentTvShowId = this.itemDataObj._id
      var currentCharactersArray = tvShowColl.findOne({_id:currentTvShowId}).characters;
      console.log(currentCharactersArray)
      currentCharactersArray.push(newCharacter);
      tvShowColl.update({'_id':currentTvShowId}, {$set:{characters:currentCharactersArray}});
      */
      return false
    }
  })
  /*
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
  
  tvShowColl.find( { 'genres':  'Adventure'   } ).fetch()

  
  */
  var characterMega = function(){return{
    includeName:'characterList',
    dataArray:'childItemDataObj',
    returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
      [
        //tvMega()
      ]
    )
  }}

  var tvMega = function(){return{
    includeName:'tvShowList',
    dataArray:tvShowColl.find().fetch(),
    returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
      [/*
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
      */]
    )
  }}
  

  //HELPER HELPER
  //HELPER HELPER
  //HELPER HELPER

  Handlebars.registerHelper('aHelper', function(a,b,c) {
    console.log('HELPER-A',a)
    //console.log(b)
    //console.log(c)
    console.log('HELPER-this',this)
  });


  
  Peanuts.viewCatalog={};
  //Template.dynamic.compare = function(lvalue, rvalue, options) {
  Handlebars.registerHelper('compareIncludeName', function(value, options) {
    if(value === this.includeName) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
  });
  

  Handlebars.registerHelper('boomer', function(a,b,options) {
    if(a === b) {
        return options.fn(this);
    } else {
        //return options.inverse(this);
    }
  });

  Handlebars.registerHelper('equal', function(a,b, options) {
    return a === b
  });

  Template.basicListItem.dataArrayProcessed = function() {
    var returnDataArray = this.dataArray;
    if(typeof this.dataArrayFiltered !== 'undefined'){
      returnDataArray = this.dataArrayFiltered;
    }
    
    return returnDataArray;
  }

  Template.basicListItem.filterDataArray = function(itemDataObj) {
    
    if(this.dataArray === 'childItemDataObj'){
      if(this.includeName === 'genreList'){
        returnDataArray = this.parent.dataArrayFiltered.genres
        this.dataArrayFiltered = itemDataObj.genres;
      }
      if(this.includeName === 'characterList'){
        returnDataArray = this.parent.dataArrayFiltered.characters
        this.dataArrayFiltered = itemDataObj.characters;
        this.boomer = itemDataObj.name
        console.log(this.boomer)
      }
    } else {
      if(this.parent.includeName === 'characterList'){
        var containsItemDataObjArray = []
        for(var i = 0, l= this.dataArray.length; i < l; i++){
          if(_.indexOf(this.dataArray[i]['characters'], itemDataObj) !== -1){
            containsItemDataObjArray.push(this.dataArray[i])
          }
        }
        this.dataArrayFiltered = containsItemDataObjArray;
      } else {
        this.dataArrayFiltered = this.dataArray;
      }
    }

  };
  Template.tvShowListPanel.settings = function(){
    this.h4Text = 'Tv Show List Panel '
  }
  Template.characterListPanel.settings = function(){
    this.h4Text = 'Character List Panel '
    this.boomer2 = this.boomer
  }
  Template.genreListPanel.settings = function(){
    this.h4Text = 'Genre List Panel '
  }
  
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
                      {
                        includeName:'tvShowList',
                        dataArray:tvShowColl.find().fetch(),
                        returnNestedViewArray:Peanuts.createReturnNestedViewArray(self,
                          [
                            {
                              includeName:'characterList',
                              dataArray:'childItemDataObj',
                              returnNestedViewArray:Peanuts.createReturnNestedViewArray(self, 
                                [
                                  
                                ]
                              )
                            },
                            {
                              includeName:'genreList',
                              dataArray:'childItemDataObj',
                              returnNestedViewArray:Peanuts.createReturnNestedViewArray(self, 
                                [
                                  
                                ]
                              )
                            },
                          ]
                        )
                      }
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





