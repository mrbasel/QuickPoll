window.onload = () => {
  const ctx = document.getElementById("myChart").getContext("2d");
  const urlId = window.location.pathname.split("/")[2];

  fetch(`http://localhost:3000/poll/${urlId}/data`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      let myChart = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
          // responsive: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    });
};
