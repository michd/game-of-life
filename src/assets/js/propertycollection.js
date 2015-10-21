(function (GOL, EventDispatcher) {
  // Key/value store with subscribe-able property changed notification.
  // May or may not be rather inspired by C#'s INotifyPropertyChanged interface
  function PropertyCollection(initialCollection) {
    var PROPERTY_CHANGED_EVENT_NAME = "propertyChanged";

    var properties = {},
      eventDispatcher = new EventDispatcher(),
      self = this;

    function constructor() {
      var key;

      if (typeof initialCollection !== "object") return;

      // We're doing a shallow copy so we don't outright use the same object
      // in memory
      for (key in initialCollection) {
        if (!initialCollection.hasOwnProperty(key)) continue;

        properties[key] = initialCollection[key];
      }
    }

    // Public
    function propertyChanged(propertyName, context) {
      eventDispatcher.trigger(
        PROPERTY_CHANGED_EVENT_NAME, {
          "propertyName": propertyName,
          "value": self.get(propertyName)
        },
        context);
    }

    // Public
    function get(propertyName) {
      return properties[propertyName];
    }

    // Public
    function set(propertyName, newValue) {
      if (properties[propertyName] === newValue) return;

      properties[propertyName] = newValue;
      self.propertyChanged(propertyName, newValue);
    }

    // Public
    function subscribe(listener) {
      eventDispatcher.subscribe(PROPERTY_CHANGED_EVENT_NAME, listener);
    }

    // Public
    function unsubscribe(listener) {
      eventDispatchers.unsubscribe(PROPERTY_CHANGED_EVENT_NAME, listener);
    }

    this.propertyChanged = propertyChanged;
    this.get = get;
    this.set = set;
    this.subscribe = subscribe;
    this.unsubscribe = unsubscribe;

    constructor();
  }

  GOL.namespace("PropertyCollection");
  GOL.PropertyCollection = PropertyCollection;

}(window.GOL, window.GOL.EventDispatcher));
