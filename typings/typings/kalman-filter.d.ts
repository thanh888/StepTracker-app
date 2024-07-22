declare module 'kalman-filter' {
  export class KalmanFilter {
    constructor(options?: any);
    filter(value: {observed: number}): {predicted: {mean: number}};
  }
}
