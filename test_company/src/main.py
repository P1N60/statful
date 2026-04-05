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

    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        screen.fill((30, 30, 40))
        # Placeholder: draw a simple player rect
        pygame.draw.rect(screen, (200, 60, 60), (WIDTH//2 - 25, HEIGHT//2 - 25, 50, 50))

        pygame.display.flip()
        clock.tick(FPS)

    pygame.quit()
    return 0

if __name__ == '__main__':
    sys.exit(main())
