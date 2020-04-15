<script>
  export let shop;
</script>

<style>
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em !important;
    font-weight: 100;
    text-align: center;
  }

  a, a:visited, a:hover {
    color: #ff3e00;
    text-decoration: none;
  }
</style>

<h1>
  <a href="/{shop.id}">{shop.title}</a>
</h1>