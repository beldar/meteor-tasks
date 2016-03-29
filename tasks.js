Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Template.tasks.helpers({
    tasks: function () {
      return Tasks.find({});
    }
  });

  Template.task.helpers({
    isMine: function() {
      return this.assigned && Meteor.userId() === this.assigned._id;
    },
    isAvailable: function() {
      return !this.assigned;
    },
    isSelected: function(value) {
      return this.status === value ? 'selected' : null
    }
  });

  Template.task.events({
    'click .tasks__task__claim-button': function (event, template) {
      Tasks.update(this._id, {
        $set: {
          assigned: Meteor.user(),
          status: 'claimed'
        }
      });
    },

    'change .tasks__task__status-select': function (event, template) {
      var updateObj = {
        status: event.target.value
      };

      if (updateObj.status === 'finished') {
        updateObj.finishedAt = new Date();
      }

      Tasks.update(this._id, {
        $set: updateObj
      });
    },

    'click .tasks__task__release-button': function (event, template) {
      Tasks.update(this._id, {
        $set: {
          assigned: false,
          status: 'unclaimed'
        }
      });
    },

    'click .debug': function (event, template) {
      console.log(this);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    //Tasks.remove({});
    Tasks.insert({
      name: 'A task',
      description: 'A description of the task',
      assigned: false,
      createdAt: new Date(),
      finishedAt: false,
      status: 'unclaimed'
    })
  });
}
