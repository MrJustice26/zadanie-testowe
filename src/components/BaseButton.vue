<template>
  <button class="btn">
    <slot></slot>
  </button>
</template>

<style lang="scss">
.btn {
  padding: 7px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: white;

  &:disabled {
    cursor: unset;
  }
}

.btn:disabled {
  background-color: gray;
  color: white;
  &:hover {
    background-color: gray;
  }
}

.btn-primary {
  background-color: $color-primary;
  &-outline {
    background-color: white;
    color: $color-primary;
    border: 1px solid $color-primary;

    &:hover {
      background-color: $color-primary;
      color: white;
    }
  }

  &:hover {
    background-color: $color-darken-primary;
  }
}

.btn-danger {
  background-color: $color-danger;
}
.btn-danger:hover {
  background-color: $color-darken-danger;
}

.btn-success {
  background-color: $color-success;
}
.btn-success:hover {
  background-color: $color-darken-success;
}
</style>
