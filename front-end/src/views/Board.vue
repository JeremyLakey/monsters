<template>
  <div class="leaderBoard">
    <h1>Leader Board</h1>
    <LeaderBoards/>
  </div>
</template>

<script>
import LeaderBoards from "../components/LeaderBoards.vue"
export default {
  name: "Board",
  components: {
    LeaderBoards
  }
}
</script>