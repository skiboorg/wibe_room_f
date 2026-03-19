<script setup lang="ts">
import {Carousel, Pagination, Slide} from "vue3-carousel";

const props = defineProps(['items'])

const carousel = ref()
const carouselConfig = {
  itemsToShow: 1,
  wrapAround: false,
  gap:60,
  //autoplay: 3000,
  pauseAutoplayOnHover: true,
  //slideEffect:'fade'

}

const slides = [
  {text: '1Присоединяйтесь в моменте к 172 тысячам людей зарабатывающим в общей сумме 1+ миллиард рублей в год, строя сообщества',
    image: 'https://placehold.co/600x400'},
  {text: '2Присоединяйтесь в моменте к 172 тысячам людей зарабатывающим в общей сумме 1+ миллиард рублей в год, строя сообщества',
    image: 'https://placehold.co/600x400'},
  {text: '3Присоединяйтесь в моменте к 172 тысячам людей зарабатывающим в общей сумме 1+ миллиард рублей в год, строя сообщества',
    image: 'https://placehold.co/600x400'},
]

</script>
<template>
  <NuxtLink to="/login">
    <UIButton show_arrow variant="outline" label="Назад"  class="mb-10 md:mb-0"/>
  </NuxtLink>

  <div class="h-full w-full flex items-start justify-center">
    <CardBase padding="lg" extra-class="max-w-[50%]">
      <div class="flex flex-col items-center justify-between gap-7">
        <BlockLogo />
        <Carousel ref="carousel" v-bind="carouselConfig" class="w-full">
          <Slide v-for="i in slides" class="flex gap-5 flex-col items-start justify-start">
            <p class="text-xl leading-[130%] font-bold">{{i.text}}</p>
            <div class="aspect-video w-full maw-w-[450px">
              <img class="w-full h-auto object-cover mb-6" :src="i.image" alt="">
            </div>
          </Slide>
        </Carousel>
        <div class="flex items-center justify-center gap-5">
          <svg @click="carousel.prev()" class="cursor-pointer" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="39" height="39" rx="19.5" fill="white"/>
            <rect x="0.5" y="0.5" width="39" height="39" rx="19.5" stroke="#E2E4E9"/>
            <path d="M22.2584 24.4083C22.3356 24.3312 22.3969 24.2397 22.4387 24.1389C22.4805 24.038 22.5021 23.93 22.5021 23.8208C22.5021 23.7117 22.4805 23.6036 22.4387 23.5028C22.3969 23.402 22.3356 23.3104 22.2584 23.2333L19.025 20L22.2584 16.7667C22.3355 16.6895 22.3967 16.5979 22.4385 16.4971C22.4802 16.3963 22.5017 16.2883 22.5017 16.1792C22.5017 16.0701 22.4802 15.962 22.4385 15.8612C22.3967 15.7604 22.3355 15.6688 22.2584 15.5917C22.1812 15.5145 22.0896 15.4533 21.9888 15.4116C21.888 15.3698 21.78 15.3483 21.6709 15.3483C21.5618 15.3483 21.4537 15.3698 21.3529 15.4116C21.2521 15.4533 21.1605 15.5145 21.0834 15.5917L17.2584 19.4167C17.1811 19.4938 17.1198 19.5853 17.078 19.6861C17.0362 19.787 17.0147 19.895 17.0147 20.0042C17.0147 20.1133 17.0362 20.2214 17.078 20.3222C17.1198 20.423 17.1811 20.5146 17.2584 20.5917L21.0834 24.4167C21.4 24.7333 21.9334 24.7333 22.2584 24.4083Z" fill="#8D95A5"/>
          </svg>

          <div class="flex gap-2">
            <svg v-for="(i,index) in slides" width="6" height="6" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="6" height="6" rx="3" :fill="carousel?.currentSlide === index ? '#E1422D' : '#E2E4E9'"/>
            </svg>
          </div>


          <svg @click="carousel.next()" class="cursor-pointer" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="39" height="39" rx="19.5" fill="white"/>
            <rect x="0.5" y="0.5" width="39" height="39" rx="19.5" stroke="#E2E4E9"/>
            <path d="M17.7416 15.5917C17.6644 15.6688 17.6031 15.7603 17.5613 15.8611C17.5194 15.962 17.4979 16.07 17.4979 16.1792C17.4979 16.2883 17.5194 16.3964 17.5613 16.4972C17.6031 16.598 17.6644 16.6896 17.7416 16.7667L20.975 20L17.7416 23.2333C17.6645 23.3105 17.6033 23.4021 17.5615 23.5029C17.5198 23.6037 17.4983 23.7117 17.4983 23.8208C17.4983 23.9299 17.5198 24.038 17.5615 24.1388C17.6033 24.2396 17.6645 24.3312 17.7416 24.4083C17.8188 24.4855 17.9104 24.5467 18.0112 24.5884C18.112 24.6302 18.22 24.6517 18.3291 24.6517C18.4382 24.6517 18.5463 24.6302 18.6471 24.5884C18.7479 24.5467 18.8395 24.4855 18.9166 24.4083L22.7416 20.5833C22.8189 20.5062 22.8802 20.4147 22.922 20.3139C22.9638 20.213 22.9853 20.105 22.9853 19.9958C22.9853 19.8867 22.9638 19.7786 22.922 19.6778C22.8802 19.577 22.8189 19.4854 22.7416 19.4083L18.9166 15.5833C18.6 15.2667 18.0666 15.2667 17.7416 15.5917Z" fill="#8D95A5"/>
          </svg>
        </div>
        <UIButton  label="Пробовать!" extra-class="w-full mb-3"/>
      </div>

    </CardBase>
  </div>
</template>
