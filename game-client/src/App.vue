
<template>
  <div class="bg-red-500 h-svh w-svw">
    <div class="h-svh w-svw" ref="gameCanvas"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useMagicKeys, useResizeObserver } from '@vueuse/core';
import * as Matter from 'matter-js'
import * as Colyseus from "colyseus.js";
import { MyRoomState } from '../../game-server/src/rooms/schema/MyRoomState'

const gameCanvas = ref<HTMLElement>()

const render = ref<Matter.Render>()
const engine = ref<Matter.Engine>(Matter.Engine.create())
const runner = ref<Matter.Runner>(Matter.Runner.create())
const client = ref(new Colyseus.Client('ws://localhost:2567'))
const room = ref<Colyseus.Room<MyRoomState>>()

const { w, a, s, d } = useMagicKeys()

const input = computed(() => {
  return {
    up: w.value,
    down: s.value,
    left: a.value,
    right: d.value
  }
})

watch(w, () => {
  console.log(input.value)
  sendVerticalInput()
})
watch(a, () => {
  console.log(input.value)
  sendHorizontalInput()
})
watch(s, () => {
  console.log(input.value)
  sendVerticalInput()
})
watch(d, () => {
  console.log(input.value)
  sendHorizontalInput()
})

const sendHorizontalInput = () => {
  if (!room.value) return
  const isPlayerMoving = input.value.left != input.value.right

  if (!isPlayerMoving) {
    room.value.send('input.horizontal', 0)
    return
  }

  if (input.value.left) {
    room.value.send('input.horizontal', -1)
    return
  }

  if (input.value.right) {
    room.value.send('input.horizontal', 1)
    return
  }
}

const sendVerticalInput = () => {
  if (!room.value) return
  const isPlayerMoving = input.value.up != input.value.down

  if (!isPlayerMoving) {
    room.value.send('input.vertical', 0)
    return
  }

  if (input.value.up) {
    room.value.send('input.vertical', -1)
    return
  }

  if (input.value.down) {
    room.value.send('input.vertical', 1)
    return
  }
}



onMounted(async () => {
  render.value = Matter.Render.create({
    element: gameCanvas.value,
    engine: engine.value,
    options: {
      width: gameCanvas.value?.offsetWidth,
      height: gameCanvas.value?.offsetHeight,
      wireframes: false,
      showDebug: true
    }
  });

  Matter.Render.run(render.value);
  Matter.Runner.run(runner.value, engine.value);
  Matter.Render.lookAt(render.value, {
      position: {
        x: 0,
        y: 0
      }
    }, {
      x: 1000,
      y: 1000
    });

  useResizeObserver(gameCanvas.value, () => {
    if (gameCanvas.value) {
      const width = gameCanvas.value?.offsetWidth;
      const height = gameCanvas.value?.offsetHeight
      if (!render.value) return
      render.value.bounds.max.x = width;
      render.value.bounds.max.y = height;
      render.value.options.width = width;
      render.value.options.height = height;
      render.value.canvas.width = width;
      render.value.canvas.height = height;
    }
    if (!render.value) return
    Matter.Render.lookAt(render.value, {
      position: {
        x: 0,
        y: 0
      }
    }, {
      x: 1000,
      y: 1000
    });
  })

  room.value = await client.value.joinOrCreate<MyRoomState>('my_room')
  room.value.onMessage('*', () => {})

  room.value.state.players.onAdd((player, key) => {
    const playerBody = Matter.Bodies.circle(player.position.x, player.position.y, 40, { isStatic: true });
    playerBody.render.fillStyle = player.color
    playerBody.label = key
    Matter.Composite.add(engine.value.world, playerBody);

    player.position.onChange(() => {
      lerpPlayerBodyToPosition(player.position.x, player.position.y)
    })

    player.onRemove(() => {
      Matter.Composite.remove(engine.value.world, playerBody);
    })

    const lerpPlayerBodyToPosition = async (x: number, y: number) => {
      const lerpDuration = 5
      const tick = 1
      let timeElapsed = 0
      while (timeElapsed < lerpDuration)
      {
        const xLerped = lerp(playerBody.position.x, x, timeElapsed / lerpDuration)
        const yLerped = lerp(playerBody.position.y, y, timeElapsed / lerpDuration)
        Matter.Body.setPosition(playerBody, {
          x: xLerped,
          y: yLerped
        })
        timeElapsed += tick
        await sleep(tick)
      }
    }
  })
})

onUnmounted(() => {
  room.value?.leave()
})

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function lerp(start: number, end: number, t: number): number {
    // Ensure t is within the range [0, 1]
    t = Math.max(0, Math.min(1, t));

    // Perform linear interpolation
    return start + t * (end - start);
}
</script>


<style scoped></style>
