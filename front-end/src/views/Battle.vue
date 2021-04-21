<template>
 <div>
   <div v-if="this.$root.$data.currentMonster === null">
     <h2>Select a monster to battle with in the Profile section</h2>
   </div>
   <div v-else>
     <div class="monster">
     <BattleScreen/>

     </div>
   </div>
 </div>
</template>

<script>
import BattleScreen from "../components/BattleScreen.vue"
export default {
  name: "Battle",
  components: {
    BattleScreen
  },
  data() {
    return {
      Monster: null,
      OtherMonster: null,
    }
  },
}
</script>
