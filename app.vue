<template>
  <Suspense>
    <main class="relative flex flex-col lg:h-screen">
      <ClientOnly>
        <Navbar border-b />

        <div class="min-h-0 flex flex-1 flex-col gap-2 lg:flex-row">
          <div class="min-w-0 flex flex-col gap-2 lg:(flex-1 flex-row)">
            <InputContainer class="min-w-0 flex-1 py-1" />
            <OutputContainer class="min-w-0 flex-1 py-1" />
          </div>
        </div>
      </ClientOnly>
    </main>

    <template #fallback>
      <div class="h-screen flex flex-center gap-1 text-3xl font-bold">
        <div class="i-ri:loader-4-fill animate-spin" />
        Loading...
      </div>
    </template>
  </Suspense>
</template>
