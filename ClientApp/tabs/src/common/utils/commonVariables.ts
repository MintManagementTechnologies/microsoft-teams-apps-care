export const defaultErrors = {
   rtkApi: {
      ATTACHMENT: {
         GET_ATTACHMENT: {
            status: 'FETCH_ERROR',
            error: 'attachmentService - getAttachment'
         } as any,
         DELETE_ATTACHMENT: {
            status: 'DELETE_ERROR',
            error: 'attachmentService - deleteAttachment'
         } as any,
         UPLOAD_ATTACHMENT: {
            status: 'UPLOAD_ERROR',
            error: 'attachmentService - uploadAttachment'
         } as any,
      },
      NOTFOUND: {
         USERGOALS: {
            status: 'FETCH_ERROR',
            error: 'getAllUserGoals - UserGoalsNotFound'
         } as any,
         MYEMPLOYEESGOALS: {
            status: 'FETCH_ERROR',
            error: 'getAllMyEmployeesGoals - MyEmployeesGoalsNotFound'
         } as any
      },
      GRAPH: {
         SEARCH_USERS: {
            status: 'SEARCH_USERS',
            error: 'graphApiService - searchUsers'
         } as any,
      }
   }
}

const tmpCurrentUserUPN = new URLSearchParams(window.location.hash).get('upn');
export const currentUserUPN = tmpCurrentUserUPN ? tmpCurrentUserUPN.toLowerCase() : '';

export const defaultAvatar = 'data:image/jpg;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAtwAAALcBRi4NFgAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAALSSURBVEiJpZbBbttGEIa/HVIyDDGwUjtWD3F88MFA6sApJPdQ9CGCPEHOQR/ASM7OE/QB8gZBb3mAogdbQmsglx4MwwojK6JZ0rAIiyC5m4Mlx5JIqmj+284M/n9md2d2lTGGIgw/f15PLLOnRFoY0wRaY1cbpTpG63YlU0dOozEo4lAFApXwov8apV4BlcIMbpCg1EH9u/U3QLJQIPS8p1j6LYbdBcQzTByTyYv6gwd/3zXL3UXg918i+jCf3BDHI+J4BORUbdhF9GHg91/mVhB63lNEHzKzJcYYfP8C379Aa32TlQirq2usrq6hlJqVStDy06SSSQUVLP12lhzAdT/ieYNbcgCtNZ43wHU/zlcywyUA4UX/dd62XF6GDIdXeSQADIdXXF6G8w7Dbvjv4BWAuur311MbNy/7bveMKBoWCgDUag6PHm3muRI75aEkltnLIwfGB1qOkphKYpk9USKtoohqtbpQoCxGibRk3KG5qNWchQKlMcY0ha/tP4d6/X5phtVqlXr9fpl+S8q8tm2zsbGJyHyYiLCxsYlt22UUCNDOdxnCMMB1u1M9MIHWGtftEoYBuZ19g7agVGfWmmUZ3e4Z5+c94jguzC6OY87Pe3S7Z2RZNh+gVEeM1lMVpGnK6ekJURQVEs8iiiJOT09I03TKbrRuSyVTR9wZs73eJ5JkbuouRJIk9HqfpkyVTB2J02gMMOYNQBgGCzu3DFE0HJ8JoNSB02gMBKC+9v0BiuMgCP43+QRBEIDiePwA3U7TxPf8/dHo+psFRqNrfM/fZ7zttxd8a/vx+3srK+++VeDeysq7re3H7yfrqQ7aedJ87tScfRE1f/EXQERpp+bs7zxpPr9rz330O50/t8Tw+2g0+uG/kC8vL3/IMM+azZ9PZn1FvwoA/vnwV+s6jn/NdPZLlqQPM50tAVhixVbFdi2x/lheWvpte+fHgmkAXwCcikczC3FDYQAAAABJRU5ErkJggg==';