Meteor.startup(function () {
  Meteor.publish("tvShows", function() {
    return tvShowColl.find();
  });
});