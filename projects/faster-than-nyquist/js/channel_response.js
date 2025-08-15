// channel_response.js
(function () {
  const FTN = window.FTN;

  // Ideal low-pass channel impulse response: h(t) = 2*BW * sinc(2*BW*t)
  FTN.channelIR = function channelIR(t, BW) {
    return 2 * BW * FTN.sinc(2 * BW * t);
  };
})();
