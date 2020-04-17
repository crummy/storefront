<script>
  export let shopId, title, subtitle;
</script>

<style>
  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em !important;
    font-weight: 100;
    text-align: center;
    margin-bottom: 0;
  }

  h2 {
    text-align: center;
    font-size: 1.2em;
    font-weight: normal;
  }

  a, a:visited, a:hover {
    color: #ff3e00;
    text-decoration: none;
  }
</style>

<h1>
  <a href="/{shopId}">{title}</a>
</h1>
{#if subtitle}
  <h2>{subtitle}</h2>
{/if}