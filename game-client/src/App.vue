
<template>
  <div class="bg-red-500 h-svh w-svw">
    <div class="h-svh w-svw" ref="gameCanvas"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMagicKeys, useResizeObserver } from '@vueuse/core';
import * as Matter from 'matter-js'

const gameCanvas = ref<HTMLElement>()

const render = ref<Matter.Render>()
const engine = ref<Matter.Engine>(Matter.Engine.create())
const runner = ref<Matter.Runner>(Matter.Runner.create())

const { w, a, s, d } = useMagicKeys()

var boxA = Matter.Bodies.circle(400, 200, 40, { isStatic: true });
boxA.render.fillStyle = 'green'
var boxB = Matter.Bodies.rectangle(450, 50, 80, 80);
var ground = Matter.Bodies.rectangle(400, 610, 810, 60, { isStatic: true });

setTimeout(() => {
  Matter.Body.setPosition(ground, {
    x: 420,
    y: 800
  })
}, 4000)

Matter.Composite.add(engine.value.world, [boxA, boxB, ground]);

onMounted(() => {
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
    })
})
</script>


<style scoped></style>
