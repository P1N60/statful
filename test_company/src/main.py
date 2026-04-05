"""Minimal Pygame scaffold for local development.
Run: python3 -m pip install pygame && python3 src/main.py
"""
import sys
import pygame

WIDTH, HEIGHT = 800, 600
FPS = 60

def main():
    pygame.init()
    screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption('MVP - Pygame Scaffold')
    clock = pygame.time.Clock()
    running = True

    # Player state
    player_size = 50
    player_x = WIDTH // 2 - player_size // 2
    player_y = HEIGHT // 2 - player_size // 2
    player_speed = 300  # pixels per second

    # Placeholder level geometry (simple obstacle)
    obstacle = pygame.Rect(WIDTH // 2 - 120, HEIGHT // 2 + 80, 240, 40)

    while running:
        dt = clock.tick(FPS) / 1000.0  # delta time in seconds
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Input handling
        keys = pygame.key.get_pressed()
        dx = dy = 0
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            dx -= 1
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            dx += 1
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            dy -= 1
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            dy += 1

        # Normalize diagonal movement
        if dx != 0 and dy != 0:
            diag = 0.7071
            dx *= diag
            dy *= diag

        # Move + resolve collisions per axis for stable sliding
        next_x = player_x + dx * player_speed * dt
        player_rect_x = pygame.Rect(int(next_x), int(player_y), player_size, player_size)
        if not player_rect_x.colliderect(obstacle):
            player_x = next_x

        next_y = player_y + dy * player_speed * dt
        player_rect_y = pygame.Rect(int(player_x), int(next_y), player_size, player_size)
        if not player_rect_y.colliderect(obstacle):
            player_y = next_y

        # Clamp to screen
        player_x = max(0, min(WIDTH - player_size, player_x))
        player_y = max(0, min(HEIGHT - player_size, player_y))

        screen.fill((30, 30, 40))
        # Draw obstacle + player
        pygame.draw.rect(screen, (80, 120, 180), obstacle)
        pygame.draw.rect(screen, (200, 60, 60), (int(player_x), int(player_y), player_size, player_size))

        pygame.display.flip()

    pygame.quit()
    return 0

if __name__ == '__main__':
    sys.exit(main())
