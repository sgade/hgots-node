$(function() {
  function setState(element, enabled) {
    if ( enabled ) {
      $(element).removeAttr('disabled');
    } else {
      $(element).attr('disabled', 'disabled');
    }
  }
  function getUsername() {
    return $("#login-username").val();
  }
  function getPassword() {
    var val = $("#login-password").val();
    return CryptoJS.SHA256(val).toString(CryptoJS.enc.hex);
  }
  
  function setButtonState() {
    var username = getUsername();
    var password = $("#login-password").val();
    
    setState($("#login"), !!username && !!password);
  }
  setButtonState();
  
  $("input").keyup(setButtonState);
  $("#login-password").keyup(function() {
    console.log(getPassword());
    $("#login-password-hash").val(getPassword());
  });
});
