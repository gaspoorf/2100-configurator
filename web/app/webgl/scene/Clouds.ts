import gsap from "gsap";
import { useAudio } from "~/composables/useAudio";


// cloouds transi sound
const { playClouds } = useAudio();

export default class CloudsTransition {
  clouds: HTMLElement[];
  cloudsContainer: HTMLElement;
  showTimeline: gsap.core.Timeline;
  hideTimeline: gsap.core.Timeline;

  constructor() {
    const cloud1 = document.querySelector(
      ".clouds-transition .cloud:nth-of-type(1)"
    ) as HTMLElement;
    const cloud2 = document.querySelector(
      ".clouds-transition .cloud:nth-of-type(2)"
    ) as HTMLElement;
    const cloud3 = document.querySelector(
      ".clouds-transition .cloud:nth-of-type(3)"
    ) as HTMLElement;
    const cloud4 = document.querySelector(
      ".clouds-transition .cloud:nth-of-type(4)"
    ) as HTMLElement;
    const cloud5= document.querySelector(
      ".clouds-transition .cloud:nth-of-type(5)"
    ) as HTMLElement;
    const cloud6 = document.querySelector(
      ".clouds-transition .cloud:nth-of-type(6)"
    ) as HTMLElement;

    const cloudsContainer = document.querySelector(
      ".clouds-transition"
    ) as HTMLElement;

    this.clouds = [cloud1, cloud2, cloud3, cloud4, cloud5, cloud6];
    this.cloudsContainer = cloudsContainer;

    // Timeline pour show
    this.showTimeline = gsap.timeline({ paused: true });
    this.showTimeline
      .to(this.clouds[0]!, { x: "0%", duration: 0.75, ease: "power2.out" }, 0)
      .to(
        this.clouds[1]!,
        { y: "0%", duration: 0.75, ease: "power2.out" },
        0.15
      )
      .to(
        this.clouds[2]!,
        { x: "0%", duration: 0.75, ease: "power2.out" },
        0.25
      )
      .to(
        this.clouds[3]!,
        { x: "0%", duration: 0.75, ease: "power2.out" },
        0.3
      )
      .to(
        this.clouds[4]!,
        { x: "0%", duration: 0.75, ease: "power2.out" },
        0.25
      )
      .to(
        this.clouds[5]!,
        { x: "0%", duration: 0.75, ease: "power2.out" },
        0.25
      )

    // Timeline pour hide
    this.hideTimeline = gsap.timeline({ paused: true });
    this.hideTimeline
      .to(
        this.clouds[0]!,
        { x: "-100%", duration: 0.75, ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
        0
      )
      .to(
        this.clouds[1]!,
        { y: "-100%", duration: 0.75, ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
        0.15
      )
      .to(
        this.clouds[2]!,
        { x: "-120%", duration: 0.75, ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
        0.2
      )
      .to(
        this.clouds[3]!,
        { x: "100%", duration: 0.75, ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
        0.25
      )
      .to(
        this.clouds[4]!,
        { x: "-120%", duration: 0.75, ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
        0.2
      )
      .to(
        this.clouds[5]!,
        { x: "100%", duration: 0.75, ease: "cubic-bezier(0.25, 0.95, 0, 1)" },
        0.25
      );
  }

  async showClouds() {
    playClouds();
    await this.showTimeline.restart().then();
  }

  async hideClouds() {
    await this.hideTimeline.restart().then();
  }
}
