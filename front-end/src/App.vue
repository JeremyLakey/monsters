<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/Profile">Profile</router-link> |
      <router-link to="/Battle">Battle</router-link> |
      <router-link to="/Board">Leader Board</router-link>
    </div>
    <router-view/>

    <div id="footer">
        <hr/>
	<a href="https://github.com/personman61/monsters">Git Hub</a>
    </div>
  </div>
</template>

<style>


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}


#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #FFb983;
}

#footer a {
float: center;
text-decoration: none;
}
</style>
