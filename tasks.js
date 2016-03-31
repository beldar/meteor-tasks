const Tasks = new Mongo.Collection('tasks');

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Session.set('filter', {});

  Template.tasks.helpers({
    tasks() {
      return Tasks.find(Session.get('filter'));
    }
  });

  Template.task.helpers({
    isMine() {
      return this.assigned && Meteor.userId() === this.assigned._id;
    },
    isAvailable() {
      return !this.assigned;
    },
    isSelected(value) {
      return this.status === value ? 'selected' : null
    }
  });

  Template.task.events({
    'click .tasks__task__claim-button'() {
      Tasks.update(this._id, {
        $set: {
          assigned: Meteor.user(),
          status: 'claimed'
        }
      });
    },

    'change .tasks__task__status-select'() {
      let updateObj = {
        status: event.target.value
      };

      if (updateObj.status === 'finished') {
        updateObj.finishedAt = new Date();
      }

      Tasks.update(this._id, {
        $set: updateObj
      });
    },

    'click .tasks__task__release-button'(){
      Tasks.update(this._id, {
        $set: {
          assigned: false,
          status: 'unclaimed'
        }
      });
    },

    'click small'(){
      Tasks.remove(this._id);
    },

    'click .debug'() {
      console.log(this);
    }
  });

  Template.add.events({
    'click .task__add__button'(e) {
      e.preventDefault();
      let overlay = document.querySelector('.overlay');
      overlay.classList.add('show');
    },
    'click .task__add__cancel'(e) {
      e.preventDefault();
      let overlay = document.querySelector('.overlay');
      overlay.classList.remove('show');
    },
    'submit .task__add__form'(e) {
      e.preventDefault();
      const form = e.target;
      const title = form.title.value;
      const desc = form.description.value;
      const tags = form.tags.value.split(',');

      if (title === '' || desc === '' || tags === '') {
        return alert('All fields must have a value!')
      }

      Tasks.insert({
        name: title,
        description: desc,
        tags: tags,
        assigned: false,
        createdAt: new Date(),
        finishedAt: false,
        status: 'unclaimed'
      });
      let overlay = document.querySelector('.overlay');
      overlay.classList.remove('show');
    }
  });

  Template.filter.events({
    'change .tasks__filter'(e) {
      let val = e.target.value;

      if (val === '-1') {
        Session.set('filter', {});
      } else {
        Session.set('filter', {status: val});
      }
    }
  })
}
