<script>
  export let shopId, title, subtitle, logo;
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
    font-weight: bold;
  }

  a, a:visited, a:hover {
    color: #ff3e00;
    text-decoration: none;
  }

  img {
    max-height: 64px;
    max-width: 64px;
  }
</style>

<h1>
  <a href="/{shopId}">{title}</a>
  {#if logo}
    <img src="{logo}" alt="Logo"/>
  {/if}
</h1>
{#if subtitle}
  <h2>{subtitle}</h2>
{/if}