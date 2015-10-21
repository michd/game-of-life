(function (GOL) {
  // Very stripped down pub/sub system
  function EventDispatcher() {
    var eventSubscribers = {},
        self = this;

    function trigger(eventName, data, context) {
      var subscribers = eventSubscribers[eventName],
          i, iMax;

      data = (data instanceof Array) ? data : [data];
      context = context || self;

      if (typeof subscribers === "undefined") return;

      for (i = 0, iMax = subscribers.length; i < iMax; i++) {
        subscribers[i].apply(context, data);
      }
    }

    function subscribe(eventName, callback) {
      if (typeof eventName !== "string") {
        throw new TypeError("subscribe: expecting string eventName");
      }

      if (typeof callback !== "function") {
        throw new TypeError("subscribe: expecting function callback");
      }

      var subscribers = eventSubscribers[eventName];

      if (typeof subscribers === "undefined") {
        subscribers = eventSubscribers[eventName] = [];
      }

      if (subscribers.indexOf(callback) > -1) return;

      subscribers.push(callback);
    }

    function unsubscribe(eventName, existingCallback) {
      var subscribers = eventSubscribers[eventName],
          index;

      if (typeof subscribers === "undefined") return;

      index = subscribers.indexOf(existingCallback);

      if (index > -1) subscribers.splice(index, 1);
    }

    this.trigger = trigger;
    this.subscribe = subscribe;
    this.unsubscribe = unsubscribe;
  }

  // Redundant in this case, but shows the desired practiced for deeper nested
  // things in the namespace hierarchy
  GOL.namespace("EventDispatcher");
  GOL.EventDispatcher = EventDispatcher;
}(window.GOL));
