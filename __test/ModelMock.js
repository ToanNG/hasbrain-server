module.exports = {
  find:   function () { return this },
  select: function () { return this },
  exec:   function () { return this },
  then:   function (onFulfill, onReject) { return this }
};