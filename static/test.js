function submitName(){
  let first_name = $('#first_name').val();
  let last_name = $('#last_name').val();
  let name = first_name + " " + last_name;
  $('#first_name').val('');
  $('#last_name').val('');
  $('#name-placard').text(name);
  document.cookie = "first_name=" + first_name;
  document.cookie = "last_name=" + last_name;
}

function submitAnimal() {
  let animal = $('#favorite_animal').val();
  $('#favorite_animal').val('');
  $('#animal-placard').text(animal);
  window.sessionStorage["favorite_animal"] = animal;
}

function submitFood() {
  let food = $('#favorite_food').val();
  $('#favorite_food').val('');
  $('#food-placard').text(food);
  window.localStorage["favorite_food"] = food;
}

function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    if (begin != 0) return null;
  }
  else
  {
    begin += 2;
  }
  var end = document.cookie.indexOf(";", begin);
  if (end == -1) {
  end = dc.length;
  }
  return decodeURI(dc.substring(begin + prefix.length, end));
}

function loadJumbotron() {
  if (getCookie("last_name") != null && getCookie("first_name") != null) {
    let name = getCookie("first_name") + " " + getCookie("last_name");
    $('#name-placard').text(name);
  }
  if (window.sessionStorage["favorite_animal"] != null) {
    let animal = window.sessionStorage["favorite_animal"];
    $('#animal-placard').text(animal);
  }
  if (window.localStorage["favorite_food"] != null) {
    let food = window.localStorage["favorite_food"];
    $('#food-placard').text(food);
  }
}

function deleteCookies() {
  document.cookie = "first_name=";
  document.cookie = "last_name=";
  $('#name-placard').text("");
}

function deleteSession() {
  window.sessionStorage.removeItem("favorite_animal");
  $('#animal-placard').text('');
}

function deleteLocal() {
  window.localStorage.removeItem("favorite_food");
  $('#food-placard').text('');
}
