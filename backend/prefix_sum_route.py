from fastapi import APIRouter, Request
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/api/assignment/prefix-sum")
async def get_prefix_sum_assignment():
    """Return the code template for the Prefix Sum problem"""
    code = '''
from typing import List

class Solution:
    def prefixSum(self, nums: List[int]) -> List[int]:
        """
        Given a list of integers, return a list where each element at index i
        is the sum of all elements in the original list from index 0 to i.
        """
        <editable>
        prefix = []
        total = 0
        for num in nums:
            total += num
            prefix.append(total)
        return prefix
        </editable>
# Driver code for testing the solution
if __name__ == "__main__":
    # Test cases
    solution = Solution()

    # Test case 1
    nums1 = [1, 2, 3, 4]
    print(f"Prefix Sum of {nums1}: {solution.prefixSum(nums1)}")  # Expected output: [1, 3, 6, 10]

    # Test case 2
    nums2 = [5, 7, 2, 1]
    print(f"Prefix Sum of {nums2}: {solution.prefixSum(nums2)}")  # Expected output: [5, 12, 14, 15]
'''
    return {"code": code}

@router.get("/api/assignment/prefix-sum-problem")
async def get_prefix_sum_problem_assignment():
    """Alias for the prefix sum problem for compatibility"""
    return await get_prefix_sum_assignment()

@router.post("/api/submit-assignment")
async def submit_assignment(request: Request):
    """Submit the completed assignment"""
    data = await request.json()
    code = data.get("code", "")
    
    # In a real application, you would save this to a database
    # For now, we'll just log it and return a success message
    logger.info(f"Received assignment submission: {code}")
    
    return {"message": "Assignment submitted successfully", "received_code": code} 