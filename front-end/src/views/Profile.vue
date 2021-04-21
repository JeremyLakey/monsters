<template>
  <div class="register">
    <div v-if="this.$root.$data.user === null">
      <div class="login">
	<h1>Login</h1>
	<input v-model="name" placeholder="Username"/>
        <input v-model="password" placeholder="Password"/>
	<button @click="login">Login</button>

        <div v-if="this.login_fail">
          <h2>Login Failed</h2>
        </div>
      </div>
      <div class="register">
	<h1>Register</h1>
	<input v-model="reg_name" placeholder ="Username"/>
        <input v-model="reg_password" placeholder="Password"/>
        <input v-model="email" placeholder="Email"/>
	<br/>
        <button @click="register">Register User</button>
        <div v-if="this.register_fail">
          <h2>Try a different username and/or email</h2>
        </div>
      </div>
    </div>
    <div v-else>
      <h1>Hey there {{$root.$data.user.name}}</h1>
      <img :src="this.$root.$data.user.path" />
      <button @click="logOutUser">Log out</button>
      <button @click="deleteUser">Delete User</button>
      <h2>Monster Creation</h2>
      <input v-model="monster_name" placeholder="Monster Name">
      <br/>
      <input v-model="description" placeholder="Describe your monster!">
      <h3>Monster Type</h3>

      <input type="radio" id="titan" value="Titan" v-model="type">
      <label for="titan">Titan</label>
      <input type="radio" id="space" value="Space" v-model="type">
      <label for="space">Space</label>
      <input type="radio" id="ghostly" value="Ghostly" v-model="type">
      <label for="ghostly">Ghostly</label>
      <br/>
      
      <button @click="makeMonster">Make Monster</button>
      <MonsterList/>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import MonsterList from "../components/MonsterList.vue";
export default {
  name: "Profile",
  data() {
    return {
      name: "",
      password: "",
      reg_name: "",
      reg_password: "",
      email: "",
      login_fail: false,
      register_fail: false,
      monster_name: "",
      description: "",
      type: "",
    }
  },
  async created() {
    try {
      let response = await axios.get('/api/user');
      this.$root.$data.user = response.data.user;
    }  catch (error) {
      this.$root.$data.user = null;
    }
  },
  methods: {
    async login(){
      console.log("Loging in with " + this.name + " " + this.password);
      try {
	let response = await axios.post('/api/user/login', {
          name: this.name,
          password: this.password
        });
	this.$root.$data.user = response.data.user;
        if (this.$root.$data.user) {
          this.login_fail = false;
          return;
        }

	this.login_fail = true;
      } catch (error) {
         console.log(error);
         this.login_fail = true;
      }
    },
    async register(){
      if (this.reg_name === "" || this.reg_password === "" || this.email === "") {
	return;
      }
      try {
        let r2 = await axios.post('/api/user', {
		name: this.reg_name,
		password: this.reg_password,
		email: this.email,
                record: 0,
        });
        this.$root.$data.user = r2.data;

      } catch (error) {
	console.log(error);
        this.register_fail = true;
      }
    },
    fileChanged(event) {
      this.file = event.target.files[0];
    },
    async makeMonster() {
	try {
                if (this.type === "" || this.monster_name === "" || this.description === "")
                  return;

		let response = await axios.post('/api/monster', {
			name: this.monster_name,
			description: this.description,
			type: this.type,
			score: 0,
			level: 1,
                });
		this.$root.$data.monsters.push(response.data);
                await this.$children[0].loadMonsters()
        } catch (error) {
		console.log(error);
	}
    },
    async deleteUser() {
      try {
          for(let i = 0; i < this.$root.$data.monsters.length; i++) {
            await axios.delete('/api/monster/' + this.$root.$data.monsters[i]._id, {});
          }
          await axios.delete('/api/user/terminate', {});
          this.$root.$data.user = null;
          location.reload();
        } catch (error) {
		console.log(error);
	}
    },
    async logOutUser() {
      try {
        await axios.delete('/api/user/', {});
        this.$root.$data.user = null;
        this.$root.$data.monsters = null;
        location.reload();
      } catch(error) {
        console.log(error);
      }
    }
  },
  watch: {
    login_fail() {
     console.log(this.login_fail);
    }
  },
  components: {
    MonsterList,
  },
}
</script>


<style>
input {
  margin: 5px;
}




</style>